// Suggestions controller — GET /suggestions (savings suggestions)
const suggestionsService = require('../services/suggestionsService');

/**
 * GET /suggestions — Returns personalized savings suggestions
 * Query param: months (default 3) — analysis period in months
 */
async function getSuggestions(req, res) {
    try {
        const userId = req.user.id;
        const months = Math.min(12, Math.max(1, parseInt(req.query.months, 10) || 3));

        const result = await suggestionsService.getSavingsSuggestions(userId, { months });

        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

module.exports = { getSuggestions };
