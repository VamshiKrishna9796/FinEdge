// Summary controller — GET /summary with cache integration
const summaryService = require('../services/summaryService');
const cacheService = require('../../services/cacheService');

const SUMMARY_CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

/**
 * GET /summary — Returns total income, expenses, and balance for the authenticated user
 * Supports query params: startDate, endDate, category (same as transactions)
 * Results are cached for performance
 */
async function getSummary(req, res) {
    try {
        const userId = req.user.id;
        const filters = {
            category: req.query.category,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const cacheKey = `summary:${userId}:${JSON.stringify(filters)}`;

        const summary = await cacheService.getOrSet(
            cacheKey,
            () => summaryService.calculateSummary(userId, filters),
            SUMMARY_CACHE_TTL_MS
        );

        res.status(200).json({ summary });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

module.exports = { getSummary };
