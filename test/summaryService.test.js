// Unit tests for Summary Service — total income, expenses, balance calculations
const summaryService = require('../src/v1/services/summaryService');
const TransactionModelHelper = require('../src/modelHelpers/transactionModelHelper');

jest.mock('../src/modelHelpers/transactionModelHelper');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('summaryService.calculateSummary', () => {
    const mockUserId = '507f1f77bcf86cd799439011';

    test('should calculate total income, expenses, and balance correctly', async () => {
        const mockTransactions = [
            { type: 'income', amount: 10000 },
            { type: 'income', amount: 5000 },
            { type: 'expense', amount: 2000 },
            { type: 'expense', amount: 1500 }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await summaryService.calculateSummary(mockUserId);

        expect(result).toEqual({
            totalIncome: 15000,
            totalExpenses: 3500,
            balance: 11500
        });
    });

    test('should return zeros when no transactions exist', async () => {
        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue([]);

        const result = await summaryService.calculateSummary(mockUserId);

        expect(result).toEqual({
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0
        });
    });

    test('should handle only income transactions', async () => {
        const mockTransactions = [
            { type: 'income', amount: 5000 },
            { type: 'income', amount: 3000 }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await summaryService.calculateSummary(mockUserId);

        expect(result).toEqual({
            totalIncome: 8000,
            totalExpenses: 0,
            balance: 8000
        });
    });

    test('should handle only expense transactions (negative balance)', async () => {
        const mockTransactions = [
            { type: 'expense', amount: 1000 },
            { type: 'expense', amount: 500 }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await summaryService.calculateSummary(mockUserId);

        expect(result).toEqual({
            totalIncome: 0,
            totalExpenses: 1500,
            balance: -1500
        });
    });

    test('should pass filters to model helper', async () => {
        const filters = { startDate: '2025-01-01', endDate: '2025-01-31', category: 'food' };
        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue([]);

        await summaryService.calculateSummary(mockUserId, filters);

        expect(TransactionModelHelper.getTransactionsByUserId).toHaveBeenCalledWith(mockUserId, filters);
    });
});
