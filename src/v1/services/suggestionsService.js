// Basic savings suggestion engine — analyzes spending and suggests ways to save
const TransactionModelHelper = require('../../modelHelpers/transactionModelHelper');

/**
 * Generate savings suggestions based on spending patterns
 * @param {string} userId - User ID
 * @param {object} options - { months: number } for analysis period
 * @returns {Promise<{suggestions: string[], spendingByCategory: object, summary: object}>}
 */
async function getSavingsSuggestions(userId, options = {}) {
    const months = options.months || 3;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const filters = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    };

    const transactions = await TransactionModelHelper.getTransactionsByUserId(userId, filters);

    let totalIncome = 0;
    let totalExpenses = 0;
    const byCategory = {};

    for (const txn of transactions) {
        const amount = Number(txn.amount) || 0;
        if (txn.type === 'income') {
            totalIncome += amount;
        } else if (txn.type === 'expense') {
            totalExpenses += amount;
            const cat = (txn.category || 'other').toLowerCase();
            byCategory[cat] = (byCategory[cat] || 0) + amount;
        }
    }

    const balance = totalIncome - totalExpenses;
    const suggestions = [];

    // Sort categories by spending (highest first)
    const topCategories = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Suggestion 1: Savings rate
    if (totalIncome > 0) {
        const savingsRate = ((balance / totalIncome) * 100).toFixed(1);
        if (balance < 0) {
            suggestions.push(
                `Your expenses exceed income by ₹${Math.abs(balance).toFixed(0)}. Focus on reducing spending in top categories.`
            );
        } else if (parseFloat(savingsRate) < 20) {
            suggestions.push(
                `Your savings rate is ${savingsRate}%. Consider saving at least 20% of your income for better financial health.`
            );
        } else {
            suggestions.push(`Great job! You're saving ${savingsRate}% of your income.`);
        }
    }

    // Suggestion 2: Top spending category
    if (topCategories.length > 0) {
        const [topCat, topAmount] = topCategories[0];
        const pct = totalExpenses > 0 ? ((topAmount / totalExpenses) * 100).toFixed(0) : 0;
        suggestions.push(
            `You spend ${pct}% (₹${topAmount.toFixed(0)}) on "${topCat}". Review this category for potential savings.`
        );
    }

    // Suggestion 3: Entertainment and dining (common overspend areas)
    const discretionaryCats = ['entertainment', 'food', 'shopping'];
    let discretionaryTotal = 0;
    for (const [cat, amt] of topCategories) {
        if (discretionaryCats.some((d) => cat.includes(d))) {
            discretionaryTotal += amt;
        }
    }
    if (discretionaryTotal > 0 && totalExpenses > 0) {
        const pct = ((discretionaryTotal / totalExpenses) * 100).toFixed(0);
        if (pct > 30) {
            suggestions.push(
                `Discretionary spending (entertainment, food, shopping) is ${pct}% of expenses. Consider setting a monthly limit.`
            );
        }
    }

    // Suggestion 4: Build emergency fund
    if (totalExpenses > 0 && balance > 0) {
        const monthsOfExpenses = (balance / totalExpenses).toFixed(1);
        if (parseFloat(monthsOfExpenses) < 3) {
            suggestions.push(
                `Aim for an emergency fund of 3–6 months of expenses (₹${(totalExpenses * 3).toFixed(0)}–₹${(totalExpenses * 6).toFixed(0)}).`
            );
        }
    }

    // Default if no data
    if (suggestions.length === 0) {
        suggestions.push('Add more transactions to get personalized savings suggestions.');
    }

    return {
        suggestions,
        spendingByCategory: byCategory,
        summary: {
            totalIncome,
            totalExpenses,
            balance
        }
    };
}

module.exports = { getSavingsSuggestions };
