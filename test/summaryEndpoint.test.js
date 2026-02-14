// Integration tests for GET /api/v1/summary endpoint using Supertest
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGO_URI = 'mongodb://localhost:27017/finedge_test';

const app = require('../src/app');
const cacheService = require('../src/services/cacheService');
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
    cacheService.clear();
});

describe('GET /api/v1/summary', () => {
    test('should return summary with totalIncome, totalExpenses, balance', async () => {
        const mockTransactions = [
            { type: 'income', amount: 10000 },
            { type: 'expense', amount: 2000 }
        ];

        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockTransactions)
        });

        const response = await request(app)
            .get('/api/v1/summary')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('summary');
        expect(response.body.summary).toHaveProperty('totalIncome', 10000);
        expect(response.body.summary).toHaveProperty('totalExpenses', 2000);
        expect(response.body.summary).toHaveProperty('balance', 8000);
    });

    test('should use cache on second request (model helper called once)', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([{ type: 'income', amount: 5000 }])
        });

        const r1 = await request(app)
            .get('/api/v1/summary')
            .set('Authorization', `Bearer ${authToken}`);

        const r2 = await request(app)
            .get('/api/v1/summary')
            .set('Authorization', `Bearer ${authToken}`);

        expect(r1.status).toBe(200);
        expect(r2.status).toBe(200);
        expect(r1.body.summary).toEqual(r2.body.summary);
        // With cache, Transaction.find should be called once
        expect(Transaction.find.mock.calls.length).toBe(1);
    });

    test('should return 401 without auth token', async () => {
        const response = await request(app).get('/api/v1/summary');

        expect(response.status).toBe(401);
    });

    test('should support date and category filters', async () => {
        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .get('/api/v1/summary?startDate=2025-01-01&endDate=2025-01-31&category=food')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Transaction.find).toHaveBeenCalled();
    });
});
