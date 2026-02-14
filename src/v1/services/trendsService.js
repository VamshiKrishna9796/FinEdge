// Monthly spending trends — aggregates income/expenses by month
const TransactionModelHelper = require('../../modelHelpers/transactionModelHelper');

/**
 * Get monthly spending and income trends for the last N months
 * @param {string} userId - User ID
 * @param {number} months - Number of months to include (default 6)
 * @returns {Promise<Array<{month: string, year: number, income: number, expenses: number, balance: number}>>}
 */
async function getMonthlyTrends(userId, months = 6) {
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

    const byMonth = {};

    for (let i = 0; i < months; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (months - 1 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        byMonth[key] = {
            month: key,
            year: d.getFullYear(),
            monthNumber: d.getMonth() + 1,
            income: 0,
            expenses: 0,
            balance: 0
        };
    }

    for (const txn of transactions) {
        const d = new Date(txn.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const amount = Number(txn.amount) || 0;

        if (!byMonth[key]) {
            byMonth[key] = {
                month: key,
                year: d.getFullYear(),
                monthNumber: d.getMonth() + 1,
                income: 0,
                expenses: 0,
                balance: 0
            };
        }

        if (txn.type === 'income') {
            byMonth[key].income += amount;
        } else if (txn.type === 'expense') {
            byMonth[key].expenses += amount;
        }
    }

    return Object.keys(byMonth)
        .sort()
        .map((k) => {
            const m = byMonth[k];
            m.balance = m.income - m.expenses;
            return m;
        });
}

module.exports = { getMonthlyTrends };
