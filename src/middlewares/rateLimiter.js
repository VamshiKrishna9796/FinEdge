// Rate limiter middleware — limits requests per IP per window
const store = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // max requests per window per IP

function rateLimiter(options = {}) {
    const windowMs = options.windowMs || WINDOW_MS;
    const max = options.max || MAX_REQUESTS;

    return (req, res, next) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();

        let entry = store.get(ip);
        if (!entry) {
            entry = { count: 0, resetAt: now + windowMs };
            store.set(ip, entry);
        }

        if (now > entry.resetAt) {
            entry.count = 0;
            entry.resetAt = now + windowMs;
        }

        entry.count++;

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));

        if (entry.count > max) {
            return res.status(429).json({
                error: 'Too many requests',
                message: `Rate limit exceeded. Try again after ${Math.ceil((entry.resetAt - now) / 1000)} seconds.`
            });
        }

        next();
    };
}

module.exports = rateLimiter;
