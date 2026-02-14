// Integration tests for GET /api/v1/suggestions (Member 3 optional)
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGO_URI = 'mongodb://localhost:27017/finedge_test';

const app = require('../src/app');
const Transaction = require('../src/models/transactionModel');

jest.mock('../src/models/transactionModel');

const generateTestToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const mockUserId = new mongoose.Types.ObjectId().toString();
let authToken;

beforeAll(() => {
    authToken = generateTestToken(mockUserId);
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/v1/suggestions', () => {
    test('should return suggestions, spendingByCategory, and summary', async () => {
        const mockTransactions = [
            { type: 'income', amount: 50000, category: 'salary' },
            { type: 'expense', amount: 15000, category: 'food' },
            { type: 'expense', amount: 10000, category: 'transport' }
        ];

        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockTransactions)
        });

        const response = await request(app)
            .get('/api/v1/suggestions')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('suggestions');
        expect(response.body).toHaveProperty('spendingByCategory');
        expect(response.body).toHaveProperty('summary');
        expect(Array.isArray(response.body.suggestions)).toBe(true);
        expect(response.body.suggestions.length).toBeGreaterThan(0);
        expect(response.body.summary).toHaveProperty('totalIncome', 50000);
        expect(response.body.summary).toHaveProperty('totalExpenses', 25000);
        expect(response.body.summary).toHaveProperty('balance', 25000);
    });

    test('should accept months query param', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .get('/api/v1/suggestions?months=6')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.suggestions).toContain(
            'Add more transactions to get personalized savings suggestions.'
        );
    });

    test('should return 401 without auth token', async () => {
        const response = await request(app).get('/api/v1/suggestions');

        expect(response.status).toBe(401);
    });
});
