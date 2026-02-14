// Summary service — calculates total income, expenses, and balance
const TransactionModelHelper = require('../../modelHelpers/transactionModelHelper');

/**
 * Calculate financial summary for a user
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters (startDate, endDate, category)
 * @returns {Promise<{totalIncome: number, totalExpenses: number, balance: number}>}
 */
async function calculateSummary(userId, filters = {}) {
    const transactions = await TransactionModelHelper.getTransactionsByUserId(userId, filters);

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const txn of transactions) {
        const amount = Number(txn.amount) || 0;
        if (txn.type === 'income') {
            totalIncome += amount;
        } else if (txn.type === 'expense') {
            totalExpenses += amount;
        }
    }

    const balance = totalIncome - totalExpenses;

    return {
        totalIncome,
        totalExpenses,
        balance
    };
}

module.exports = { calculateSummary };
