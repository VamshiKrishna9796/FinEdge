// Integration tests for Transaction CRUD API endpoints
// Uses Supertest to test the transaction routes end-to-end with mocked DB
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Set test environment variables before requiring app
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGO_URI = 'mongodb://localhost:27017/finedge_test';

const app = require('../src/app');
const Transaction = require('../src/models/transactionModel');

// Mock mongoose connection and Transaction model
jest.mock('../src/models/transactionModel');

// Generate a valid JWT token for testing
const generateTestToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const mockUserId = new mongoose.Types.ObjectId().toString();
const mockTransactionId = new mongoose.Types.ObjectId().toString();
let authToken;

beforeAll(() => {
    authToken = generateTestToken(mockUserId);
});

beforeEach(() => {
    jest.clearAllMocks();
});

// ========================
// POST /api/v1/transactions
// ========================
describe('POST /api/v1/transactions', () => {
    test('should create a new transaction with valid data', async () => {
        const transactionData = {
            type: 'expense',
            amount: 250,
            category: 'food',
            description: 'Grocery shopping at store'
        };

        const savedTransaction = {
            _id: mockTransactionId,
            userId: mockUserId,
            ...transactionData,
            date: new Date(),
            save: jest.fn().mockResolvedValue(true)
        };

        Transaction.mockImplementation(() => ({
            ...savedTransaction,
            save: jest.fn().mockResolvedValue(savedTransaction)
        }));

        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send(transactionData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transaction');
    });

    test('should auto-categorize when category is not provided', async () => {
        const transactionData = {
            type: 'expense',
            amount: 100,
            description: 'uber ride to office'
        };

        const savedTransaction = {
            _id: mockTransactionId,
            userId: mockUserId,
            ...transactionData,
            category: 'transport',
            save: jest.fn().mockResolvedValue(true)
        };

        Transaction.mockImplementation(() => ({
            ...savedTransaction,
            save: jest.fn().mockResolvedValue(savedTransaction)
        }));

        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send(transactionData);

        expect(response.status).toBe(201);
    });

    test('should return 400 when type is missing', async () => {
        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: 100 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 when amount is missing', async () => {
        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ type: 'income' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 when amount is negative', async () => {
        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ type: 'income', amount: -50 });

        expect(response.status).toBe(400);
    });

    test('should return 400 when type is invalid', async () => {
        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ type: 'transfer', amount: 100 });

        expect(response.status).toBe(400);
    });

    test('should return 401 without auth token', async () => {
        const response = await request(app)
            .post('/api/v1/transactions')
            .send({ type: 'income', amount: 100 });

        expect(response.status).toBe(401);
    });
});

// ========================
// GET /api/v1/transactions
// ========================
describe('GET /api/v1/transactions', () => {
    test('should fetch all transactions for authenticated user', async () => {
        const mockTransactions = [
            { _id: 'txn1', userId: mockUserId, type: 'income', amount: 5000, category: 'salary' },
            { _id: 'txn2', userId: mockUserId, type: 'expense', amount: 200, category: 'food' }
        ];

        // Mock the chained query: Transaction.find().sort()
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockTransactions)
        });

        const response = await request(app)
            .get('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transactions');
        expect(response.body.transactions).toHaveLength(2);
    });

    test('should return empty array when no transactions exist', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .get('/api/v1/transactions')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.transactions).toHaveLength(0);
    });

    test('should filter transactions by category', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([
                { _id: 'txn1', category: 'food', amount: 100 }
            ])
        });

        const response = await request(app)
            .get('/api/v1/transactions?category=food')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
    });

    test('should filter transactions by date range', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .get('/api/v1/transactions?startDate=2025-01-01&endDate=2025-01-31')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
    });

    test('should filter transactions by type', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .get('/api/v1/transactions?type=income')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
    });

    test('should return 401 without auth token', async () => {
        const response = await request(app)
            .get('/api/v1/transactions');

        expect(response.status).toBe(401);
    });
});

// ========================
// GET /api/v1/transactions/:id
// ========================
describe('GET /api/v1/transactions/:id', () => {
    test('should return a single transaction by ID', async () => {
        const mockTransaction = {
            _id: mockTransactionId,
            userId: { toString: () => mockUserId },
            type: 'income',
            amount: 5000,
            category: 'salary'
        };

        Transaction.findById.mockResolvedValue(mockTransaction);

        const response = await request(app)
            .get(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transaction');
    });

    test('should return 404 when transaction not found', async () => {
        Transaction.findById.mockResolvedValue(null);

        const response = await request(app)
            .get(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Transaction not found');
    });

    test('should return 400 for invalid transaction ID format', async () => {
        const response = await request(app)
            .get('/api/v1/transactions/invalid-id')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid transaction ID format');
    });

    test('should return 403 when transaction belongs to another user', async () => {
        const mockTransaction = {
            _id: mockTransactionId,
            userId: { toString: () => 'different-user-id' },
            type: 'income',
            amount: 5000
        };

        Transaction.findById.mockResolvedValue(mockTransaction);

        const response = await request(app)
            .get(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(403);
    });
});

// ========================
// PATCH /api/v1/transactions/:id
// ========================
describe('PATCH /api/v1/transactions/:id', () => {
    test('should update a transaction partially', async () => {
        const existingTransaction = {
            _id: mockTransactionId,
            userId: { toString: () => mockUserId },
            type: 'expense',
            amount: 100,
            category: 'food'
        };

        const updatedTransaction = {
            ...existingTransaction,
            amount: 200
        };

        Transaction.findById.mockResolvedValue(existingTransaction);
        Transaction.findByIdAndUpdate.mockResolvedValue(updatedTransaction);

        const response = await request(app)
            .patch(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: 200 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('transaction');
    });

    test('should return 404 when transaction to update not found', async () => {
        Transaction.findById.mockResolvedValue(null);

        const response = await request(app)
            .patch(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: 200 });

        expect(response.status).toBe(404);
    });

    test('should return 400 with empty update body', async () => {
        const response = await request(app)
            .patch(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({});

        expect(response.status).toBe(400);
    });

    test('should return 400 with invalid amount in update', async () => {
        const response = await request(app)
            .patch(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: -50 });

        expect(response.status).toBe(400);
    });

    test('should return 400 for invalid transaction ID format', async () => {
        const response = await request(app)
            .patch('/api/v1/transactions/bad-id')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: 200 });

        expect(response.status).toBe(400);
    });
});

// ========================
// DELETE /api/v1/transactions/:id
// ========================
describe('DELETE /api/v1/transactions/:id', () => {
    test('should delete a transaction successfully', async () => {
        const existingTransaction = {
            _id: mockTransactionId,
            userId: { toString: () => mockUserId },
            type: 'expense',
            amount: 100
        };

        Transaction.findById.mockResolvedValue(existingTransaction);
        Transaction.findByIdAndDelete.mockResolvedValue(existingTransaction);

        const response = await request(app)
            .delete(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Transaction deleted successfully');
    });

    test('should return 404 when transaction to delete not found', async () => {
        Transaction.findById.mockResolvedValue(null);

        const response = await request(app)
            .delete(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
    });

    test('should return 403 when deleting another user transaction', async () => {
        const existingTransaction = {
            _id: mockTransactionId,
            userId: { toString: () => 'other-user-id' }
        };

        Transaction.findById.mockResolvedValue(existingTransaction);

        const response = await request(app)
            .delete(`/api/v1/transactions/${mockTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(403);
    });

    test('should return 400 for invalid transaction ID format', async () => {
        const response = await request(app)
            .delete('/api/v1/transactions/not-valid')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
    });

    test('should return 401 without auth token', async () => {
        const response = await request(app)
            .delete(`/api/v1/transactions/${mockTransactionId}`);

        expect(response.status).toBe(401);
    });
});
