// Unit tests for Suggestions Service — savings suggestion engine
const suggestionsService = require('../src/v1/services/suggestionsService');
const TransactionModelHelper = require('../src/modelHelpers/transactionModelHelper');

jest.mock('../src/modelHelpers/transactionModelHelper');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('suggestionsService.getSavingsSuggestions', () => {
    const mockUserId = '507f1f77bcf86cd799439011';

    test('should return suggestions and spending by category', async () => {
        const mockTransactions = [
            { type: 'income', amount: 50000, category: 'salary' },
            { type: 'expense', amount: 15000, category: 'food' },
            { type: 'expense', amount: 10000, category: 'transport' },
            { type: 'expense', amount: 5000, category: 'entertainment' }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await suggestionsService.getSavingsSuggestions(mockUserId, { months: 3 });

        expect(result).toHaveProperty('suggestions');
        expect(result).toHaveProperty('spendingByCategory');
        expect(result).toHaveProperty('summary');
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.spendingByCategory).toHaveProperty('food', 15000);
        expect(result.spendingByCategory).toHaveProperty('transport', 10000);
        expect(result.summary.totalIncome).toBe(50000);
        expect(result.summary.totalExpenses).toBe(30000);
        expect(result.summary.balance).toBe(20000);
    });

    test('should suggest reducing spending when expenses exceed income', async () => {
        const mockTransactions = [
            { type: 'income', amount: 10000 },
            { type: 'expense', amount: 15000, category: 'food' }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await suggestionsService.getSavingsSuggestions(mockUserId);

        const hasOverspendSuggestion = result.suggestions.some((s) =>
            s.toLowerCase().includes('expenses exceed income') || s.toLowerCase().includes('exceed')
        );
        expect(hasOverspendSuggestion).toBe(true);
    });

    test('should identify top spending category', async () => {
        const mockTransactions = [
            { type: 'expense', amount: 5000, category: 'food' },
            { type: 'expense', amount: 10000, category: 'shopping' },
            { type: 'expense', amount: 2000, category: 'transport' }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await suggestionsService.getSavingsSuggestions(mockUserId);

        const hasTopCategorySuggestion = result.suggestions.some((s) =>
            s.includes('shopping') && s.includes('%')
        );
        expect(hasTopCategorySuggestion).toBe(true);
    });

    test('should provide default suggestion when no transactions', async () => {
        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue([]);

        const result = await suggestionsService.getSavingsSuggestions(mockUserId);

        expect(result.suggestions).toContain('Add more transactions to get personalized savings suggestions.');
    });
});
