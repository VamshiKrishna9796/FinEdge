// Unit tests for Trends Service — monthly spending trends
const trendsService = require('../src/v1/services/trendsService');
const TransactionModelHelper = require('../src/modelHelpers/transactionModelHelper');

jest.mock('../src/modelHelpers/transactionModelHelper');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('trendsService.getMonthlyTrends', () => {
    const mockUserId = '507f1f77bcf86cd799439011';

    test('should return monthly income and expenses grouped by month', async () => {
        const now = new Date();
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const mockTransactions = [
            { type: 'income', amount: 10000, date: now },
            { type: 'expense', amount: 2000, date: now },
            { type: 'income', amount: 5000, date: lastMonth },
            { type: 'expense', amount: 3000, date: lastMonth }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await trendsService.getMonthlyTrends(mockUserId, 6);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(6);
        expect(result.every((m) => m.income !== undefined && m.expenses !== undefined && m.balance !== undefined)).toBe(true);
    });

    test('should pass date filters to model helper', async () => {
        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue([]);

        await trendsService.getMonthlyTrends(mockUserId, 3);

        expect(TransactionModelHelper.getTransactionsByUserId).toHaveBeenCalledWith(
            mockUserId,
            expect.objectContaining({
                startDate: expect.any(String),
                endDate: expect.any(String)
            })
        );
    });

    test('should compute balance per month correctly', async () => {
        const d = new Date();
        const mockTransactions = [
            { type: 'income', amount: 10000, date: d },
            { type: 'expense', amount: 2500, date: d }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await trendsService.getMonthlyTrends(mockUserId, 1);

        const currentMonth = result.find((m) => m.month === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        if (currentMonth) {
            expect(currentMonth.income).toBe(10000);
            expect(currentMonth.expenses).toBe(2500);
            expect(currentMonth.balance).toBe(7500);
        }
    });
});
