// Unit tests for Transaction Validation Middleware
const {
    validateCreateTransaction,
    validateUpdateTransaction,
    validateTransactionId
} = require('../src/middlewares/transactionValidation');

// Helper to create mock req, res, next
const mockRequest = (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
});

// ========================
// validateCreateTransaction
// ========================
describe('validateCreateTransaction', () => {
    test('should pass validation with valid income transaction', () => {
        const req = mockRequest({
            type: 'income',
            amount: 5000,
            description: 'Salary for January'
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('should pass validation with valid expense transaction', () => {
        const req = mockRequest({
            type: 'expense',
            amount: 150.50,
            description: 'Grocery shopping'
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    test('should fail when type is missing', () => {
        const req = mockRequest({
            amount: 100
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['type is required'])
            })
        );
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should fail when type is invalid', () => {
        const req = mockRequest({
            type: 'transfer',
            amount: 100
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['type must be either "income" or "expense"'])
            })
        );
    });

    test('should fail when amount is missing', () => {
        const req = mockRequest({
            type: 'income'
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['amount is required'])
            })
        );
    });

    test('should fail when amount is negative', () => {
        const req = mockRequest({
            type: 'expense',
            amount: -50
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['amount must be greater than 0'])
            })
        );
    });

    test('should fail when amount is zero', () => {
        const req = mockRequest({
            type: 'income',
            amount: 0
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail when amount is not a number', () => {
        const req = mockRequest({
            type: 'income',
            amount: 'abc'
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['amount must be a valid number'])
            })
        );
    });

    test('should fail with invalid date', () => {
        const req = mockRequest({
            type: 'income',
            amount: 100,
            date: 'not-a-date'
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['date must be a valid date'])
            })
        );
    });

    test('should pass with a valid date string', () => {
        const req = mockRequest({
            type: 'expense',
            amount: 200,
            date: '2025-06-15'
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    test('should fail when description is not a string', () => {
        const req = mockRequest({
            type: 'income',
            amount: 100,
            description: 12345
        });
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['description must be a string'])
            })
        );
    });

    test('should collect multiple errors at once', () => {
        const req = mockRequest({});
        const res = mockResponse();

        validateCreateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        const response = res.json.mock.calls[0][0];
        expect(response.errors.length).toBeGreaterThanOrEqual(2);
    });
});

// ========================
// validateUpdateTransaction
// ========================
describe('validateUpdateTransaction', () => {
    test('should pass with valid partial update (amount only)', () => {
        const req = mockRequest({ amount: 200 });
        const res = mockResponse();

        validateUpdateTransaction(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    test('should pass with valid partial update (type only)', () => {
        const req = mockRequest({ type: 'income' });
        const res = mockResponse();

        validateUpdateTransaction(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    test('should fail with empty body', () => {
        const req = mockRequest({});
        const res = mockResponse();

        validateUpdateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                errors: expect.arrayContaining(['At least one field must be provided for update'])
            })
        );
    });

    test('should fail with invalid type in update', () => {
        const req = mockRequest({ type: 'debit' });
        const res = mockResponse();

        validateUpdateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail with invalid amount in update', () => {
        const req = mockRequest({ amount: -10 });
        const res = mockResponse();

        validateUpdateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should pass with category update', () => {
        const req = mockRequest({ category: 'food' });
        const res = mockResponse();

        validateUpdateTransaction(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    test('should fail when category is not a string', () => {
        const req = mockRequest({ category: 123 });
        const res = mockResponse();

        validateUpdateTransaction(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ========================
// validateTransactionId
// ========================
describe('validateTransactionId', () => {
    test('should pass with valid MongoDB ObjectId', () => {
        const req = mockRequest({}, { id: '507f1f77bcf86cd799439011' });
        const res = mockResponse();

        validateTransactionId(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    test('should fail with invalid ObjectId', () => {
        const req = mockRequest({}, { id: 'invalid-id' });
        const res = mockResponse();

        validateTransactionId(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Invalid transaction ID format'
            })
        );
    });

    test('should fail with short ObjectId', () => {
        const req = mockRequest({}, { id: '12345' });
        const res = mockResponse();

        validateTransactionId(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail with empty id', () => {
        const req = mockRequest({}, { id: '' });
        const res = mockResponse();

        validateTransactionId(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
