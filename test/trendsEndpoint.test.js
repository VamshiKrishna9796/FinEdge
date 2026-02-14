// Integration tests for GET /api/v1/trends (Member 3 optional)
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

describe('GET /api/v1/trends', () => {
    test('should return monthly trends with income, expenses, balance per month', async () => {
        const now = new Date();
        const mockTransactions = [
            { type: 'income', amount: 10000, date: now },
            { type: 'expense', amount: 2000, date: now }
        ];

        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockTransactions)
        });

        const response = await request(app)
            .get('/api/v1/trends')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('trends');
        expect(Array.isArray(response.body.trends)).toBe(true);
        expect(response.body.trends.length).toBeGreaterThan(0);
        expect(response.body.trends[0]).toHaveProperty('month');
        expect(response.body.trends[0]).toHaveProperty('income');
        expect(response.body.trends[0]).toHaveProperty('expenses');
        expect(response.body.trends[0]).toHaveProperty('balance');
    });

    test('should accept months query param', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .get('/api/v1/trends?months=3')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.trends).toHaveLength(3);
    });

    test('should return 401 without auth token', async () => {
        const response = await request(app).get('/api/v1/trends');

        expect(response.status).toBe(401);
    });
});
