// Trends controller — GET /trends (monthly spending trends)
const trendsService = require('../services/trendsService');

/**
 * GET /trends — Returns monthly income/expense trends for the authenticated user
 * Query param: months (default 6) — number of months to include
 */
async function getTrends(req, res) {
    try {
        const userId = req.user.id;
        const months = Math.min(24, Math.max(1, parseInt(req.query.months, 10) || 6));

        const trends = await trendsService.getMonthlyTrends(userId, months);

        res.status(200).json({ trends });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

module.exports = { getTrends };
