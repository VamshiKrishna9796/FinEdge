// Unit tests for Transaction Service — business logic + auto-categorization
const TransactionService = require('../src/v1/services/transactionService');
const TransactionModelHelper = require('../src/modelHelpers/transactionModelHelper');

// Mock the TransactionModelHelper so we don't need a real DB
jest.mock('../src/modelHelpers/transactionModelHelper');

beforeEach(() => {
    jest.clearAllMocks();
});

// ========================
// Auto-Categorize Tests
// ========================
describe('TransactionService.autoCategorize', () => {
    test('should categorize "pizza dinner" as food', () => {
        expect(TransactionService.autoCategorize('pizza dinner')).toBe('food');
    });

    test('should categorize "uber ride to office" as transport', () => {
        expect(TransactionService.autoCategorize('uber ride to office')).toBe('transport');
    });

    test('should categorize "netflix subscription" as entertainment', () => {
        expect(TransactionService.autoCategorize('netflix subscription')).toBe('entertainment');
    });

    test('should categorize "amazon purchase" as shopping', () => {
        expect(TransactionService.autoCategorize('amazon purchase')).toBe('shopping');
    });

    test('should categorize "electricity bill payment" as bills', () => {
        expect(TransactionService.autoCategorize('electricity bill payment')).toBe('bills');
    });

    test('should categorize "doctor visit" as health', () => {
        expect(TransactionService.autoCategorize('doctor visit')).toBe('health');
    });

    test('should categorize "udemy course" as education', () => {
        expect(TransactionService.autoCategorize('udemy course')).toBe('education');
    });

    test('should categorize "salary credit" as salary', () => {
        expect(TransactionService.autoCategorize('salary credit')).toBe('salary');
    });

    test('should categorize "freelance project payment" as freelance', () => {
        expect(TransactionService.autoCategorize('freelance project payment')).toBe('freelance');
    });

    test('should categorize "mutual fund dividend" as investment', () => {
        expect(TransactionService.autoCategorize('mutual fund dividend')).toBe('investment');
    });

    test('should return "other" for unrecognized description', () => {
        expect(TransactionService.autoCategorize('random stuff')).toBe('other');
    });

    test('should return "other" for empty description', () => {
        expect(TransactionService.autoCategorize('')).toBe('other');
    });

    test('should return "other" for null/undefined description', () => {
        expect(TransactionService.autoCategorize(null)).toBe('other');
        expect(TransactionService.autoCategorize(undefined)).toBe('other');
    });

    test('should be case-insensitive', () => {
        expect(TransactionService.autoCategorize('UBER Ride')).toBe('transport');
        expect(TransactionService.autoCategorize('Netflix')).toBe('entertainment');
    });
});

// ========================
// createTransaction Tests
// ========================
describe('TransactionService.createTransaction', () => {
    const mockUserId = '507f1f77bcf86cd799439011';

    test('should create transaction with explicit category', async () => {
        const transactionData = {
            type: 'expense',
            amount: 500,
            category: 'food',
            description: 'Lunch at cafe'
        };

        const expectedTransaction = {
            _id: 'txn123',
            userId: mockUserId,
            ...transactionData
        };

        TransactionModelHelper.createTransaction.mockResolvedValue(expectedTransaction);

        const result = await TransactionService.createTransaction(mockUserId, transactionData);

        expect(TransactionModelHelper.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: mockUserId,
                type: 'expense',
                amount: 500,
                category: 'food',
                description: 'Lunch at cafe'
            })
        );
        expect(result).toEqual(expectedTransaction);
    });

    test('should auto-categorize when category is not provided', async () => {
        const transactionData = {
            type: 'expense',
            amount: 300,
            description: 'uber ride to airport'
        };

        TransactionModelHelper.createTransaction.mockResolvedValue({
            _id: 'txn456',
            userId: mockUserId,
            ...transactionData,
            category: 'transport'
        });

        await TransactionService.createTransaction(mockUserId, transactionData);

        expect(TransactionModelHelper.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                category: 'transport'
            })
        );
    });

    test('should auto-categorize when category is "auto"', async () => {
        const transactionData = {
            type: 'income',
            amount: 50000,
            category: 'auto',
            description: 'salary for february'
        };

        TransactionModelHelper.createTransaction.mockResolvedValue({
            _id: 'txn789',
            userId: mockUserId,
            ...transactionData,
            category: 'salary'
        });

        await TransactionService.createTransaction(mockUserId, transactionData);

        expect(TransactionModelHelper.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                category: 'salary'
            })
        );
    });

    test('should set default empty description if not provided', async () => {
        const transactionData = {
            type: 'expense',
            amount: 100,
            category: 'food'
        };

        TransactionModelHelper.createTransaction.mockResolvedValue({ _id: 'txn000' });

        await TransactionService.createTransaction(mockUserId, transactionData);

        expect(TransactionModelHelper.createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                description: ''
            })
        );
    });
});

// ========================
// getTransactions Tests
// ========================
describe('TransactionService.getTransactions', () => {
    const mockUserId = '507f1f77bcf86cd799439011';

    test('should fetch all transactions for a user', async () => {
        const mockTransactions = [
            { _id: 'txn1', amount: 100, type: 'income' },
            { _id: 'txn2', amount: 200, type: 'expense' }
        ];

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue(mockTransactions);

        const result = await TransactionService.getTransactions(mockUserId);

        expect(TransactionModelHelper.getTransactionsByUserId).toHaveBeenCalledWith(mockUserId, {});
        expect(result).toEqual(mockTransactions);
        expect(result.length).toBe(2);
    });

    test('should pass filters to model helper', async () => {
        const filters = { category: 'food', startDate: '2025-01-01', endDate: '2025-01-31' };

        TransactionModelHelper.getTransactionsByUserId.mockResolvedValue([]);

        await TransactionService.getTransactions(mockUserId, filters);

        expect(TransactionModelHelper.getTransactionsByUserId).toHaveBeenCalledWith(mockUserId, filters);
    });
});

// ========================
// getTransactionById Tests
// ========================
describe('TransactionService.getTransactionById', () => {
    const mockUserId = '507f1f77bcf86cd799439011';
    const mockTxnId = '607f1f77bcf86cd799439022';

    test('should return transaction when it belongs to user', async () => {
        const mockTransaction = {
            _id: mockTxnId,
            userId: { toString: () => mockUserId },
            amount: 100,
            type: 'income'
        };

        TransactionModelHelper.getTransactionById.mockResolvedValue(mockTransaction);

        const result = await TransactionService.getTransactionById(mockUserId, mockTxnId);

        expect(result).toEqual(mockTransaction);
    });

    test('should return null when transaction not found', async () => {
        TransactionModelHelper.getTransactionById.mockResolvedValue(null);

        const result = await TransactionService.getTransactionById(mockUserId, mockTxnId);

        expect(result).toBeNull();
    });

    test('should throw 403 when transaction belongs to different user', async () => {
        const mockTransaction = {
            _id: mockTxnId,
            userId: { toString: () => 'different-user-id' },
            amount: 100,
            type: 'income'
        };

        TransactionModelHelper.getTransactionById.mockResolvedValue(mockTransaction);

        await expect(
            TransactionService.getTransactionById(mockUserId, mockTxnId)
        ).rejects.toThrow('Forbidden: You do not own this transaction');
    });
});

// ========================
// updateTransaction Tests
// ========================
describe('TransactionService.updateTransaction', () => {
    const mockUserId = '507f1f77bcf86cd799439011';
    const mockTxnId = '607f1f77bcf86cd799439022';

    test('should update transaction when user owns it', async () => {
        const existingTransaction = {
            _id: mockTxnId,
            userId: { toString: () => mockUserId },
            amount: 100,
            type: 'income'
        };

        const updatedTransaction = {
            _id: mockTxnId,
            userId: mockUserId,
            amount: 200,
            type: 'income'
        };

        TransactionModelHelper.getTransactionById.mockResolvedValue(existingTransaction);
        TransactionModelHelper.updateTransaction.mockResolvedValue(updatedTransaction);

        const result = await TransactionService.updateTransaction(mockUserId, mockTxnId, { amount: 200 });

        expect(result).toEqual(updatedTransaction);
        expect(TransactionModelHelper.updateTransaction).toHaveBeenCalledWith(mockTxnId, { amount: 200 });
    });

    test('should return null when transaction not found', async () => {
        TransactionModelHelper.getTransactionById.mockResolvedValue(null);

        const result = await TransactionService.updateTransaction(mockUserId, mockTxnId, { amount: 200 });

        expect(result).toBeNull();
    });

    test('should throw 403 when user does not own the transaction', async () => {
        const existingTransaction = {
            _id: mockTxnId,
            userId: { toString: () => 'other-user' },
            amount: 100
        };

        TransactionModelHelper.getTransactionById.mockResolvedValue(existingTransaction);

        await expect(
            TransactionService.updateTransaction(mockUserId, mockTxnId, { amount: 200 })
        ).rejects.toThrow('Forbidden: You do not own this transaction');
    });

    test('should re-categorize when description is updated without category', async () => {
        const existingTransaction = {
            _id: mockTxnId,
            userId: { toString: () => mockUserId },
            amount: 100,
            category: 'other'
        };

        TransactionModelHelper.getTransactionById.mockResolvedValue(existingTransaction);
        TransactionModelHelper.updateTransaction.mockResolvedValue({});

        await TransactionService.updateTransaction(mockUserId, mockTxnId, {
            description: 'uber ride home'
        });

        expect(TransactionModelHelper.updateTransaction).toHaveBeenCalledWith(
            mockTxnId,
            expect.objectContaining({
                description: 'uber ride home',
                category: 'transport'
            })
        );
    });
});

// ========================
// deleteTransaction Tests
// ========================
describe('TransactionService.deleteTransaction', () => {
    const mockUserId = '507f1f77bcf86cd799439011';
    const mockTxnId = '607f1f77bcf86cd799439022';

    test('should delete transaction when user owns it', async () => {
        const existingTransaction = {
            _id: mockTxnId,
            userId: { toString: () => mockUserId },
            amount: 100
        };

        TransactionModelHelper.getTransactionById.mockResolvedValue(existingTransaction);
        TransactionModelHelper.deleteTransaction.mockResolvedValue(existingTransaction);

        const result = await TransactionService.deleteTransaction(mockUserId, mockTxnId);

        expect(result).toEqual(existingTransaction);
        expect(TransactionModelHelper.deleteTransaction).toHaveBeenCalledWith(mockTxnId);
    });

    test('should return null when transaction not found', async () => {
        TransactionModelHelper.getTransactionById.mockResolvedValue(null);

        const result = await TransactionService.deleteTransaction(mockUserId, mockTxnId);

        expect(result).toBeNull();
    });

    test('should throw 403 when user does not own the transaction', async () => {
        const existingTransaction = {
            _id: mockTxnId,
            userId: { toString: () => 'other-user' }
        };

        TransactionModelHelper.getTransactionById.mockResolvedValue(existingTransaction);

        await expect(
            TransactionService.deleteTransaction(mockUserId, mockTxnId)
        ).rejects.toThrow('Forbidden: You do not own this transaction');
    });
});
