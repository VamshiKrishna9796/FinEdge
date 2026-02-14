// Unit tests for Rate Limiter middleware (Member 3)
const rateLimiter = require('../src/middlewares/rateLimiter');

describe('rateLimiter middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            ip: '127.0.0.1',
            connection: { remoteAddress: '127.0.0.1' }
        };
        res = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('should call next when under limit', () => {
        const limiter = rateLimiter({ max: 5 });
        limiter(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
    });

    test('should return 429 when over limit', () => {
        req.ip = '192.168.1.99'; // unique IP to avoid shared state
        const limiter = rateLimiter({ max: 2, windowMs: 60000 });
        limiter(req, res, next);
        limiter(req, res, next);
        limiter(req, res, next); // 3rd request - over limit
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Too many requests',
                message: expect.stringContaining('Rate limit exceeded')
            })
        );
        expect(next).toHaveBeenCalledTimes(2); // next only called for first 2
    });

    test('should set CORS-related rate limit headers', () => {
        const limiter = rateLimiter({ max: 100 });
        limiter(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
    });
});
