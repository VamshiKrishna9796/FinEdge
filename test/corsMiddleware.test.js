// Unit tests for CORS middleware (Member 3)
const corsMiddleware = require('../src/middlewares/corsMiddleware');

describe('corsMiddleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = { method: 'GET' };
        res = {
            setHeader: jest.fn(),
            sendStatus: jest.fn()
        };
        next = jest.fn();
    });

    test('should set CORS headers on request', () => {
        const middleware = corsMiddleware();
        middleware(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
        expect(res.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Methods',
            'GET, POST, PATCH, DELETE, OPTIONS'
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization'
        );
        expect(next).toHaveBeenCalled();
    });

    test('should return 204 for OPTIONS preflight', () => {
        req.method = 'OPTIONS';
        const middleware = corsMiddleware();
        middleware(req, res, next);
        expect(res.sendStatus).toHaveBeenCalledWith(204);
        expect(next).not.toHaveBeenCalled();
    });

    test('should allow custom origin when provided', () => {
        const middleware = corsMiddleware({ origin: 'https://example.com' });
        middleware(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://example.com');
    });
});
