// CORS middleware — allows cross-origin requests from specified origins
function corsMiddleware(options = {}) {
    const allowOrigin = options.origin || '*';
    const allowMethods = options.methods || ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];
    const allowHeaders = options.headers || ['Content-Type', 'Authorization'];

    return (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', allowOrigin);
        res.setHeader('Access-Control-Allow-Methods', allowMethods.join(', '));
        res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(', '));

        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }

        next();
    };
}

module.exports = corsMiddleware;
