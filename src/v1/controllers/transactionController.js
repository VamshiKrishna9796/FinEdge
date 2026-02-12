// Transaction controller — handles HTTP request/response for transaction endpoints
const TransactionService = require('../services/transactionService');

class TransactionController {
    /**
     * POST /transactions — Create a new transaction
     */
    static async createTransaction(req, res) {
        try {
            const userId = req.user.id;
            const transactionData = req.body;
            const transaction = await TransactionService.createTransaction(userId, transactionData);
            res.status(201).json({ transaction });
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    /**
     * GET /transactions — Fetch all transactions for the authenticated user
     * Supports query params: category, type, startDate, endDate
     */
    static async getTransactions(req, res) {
        try {
            const userId = req.user.id;
            const filters = {
                category: req.query.category,
                type: req.query.type,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };
            const transactions = await TransactionService.getTransactions(userId, filters);
            res.status(200).json({ transactions });
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    /**
     * GET /transactions/:id — Get a single transaction by ID
     */
    static async getTransactionById(req, res) {
        try {
            const userId = req.user.id;
            const transactionId = req.params.id;
            const transaction = await TransactionService.getTransactionById(userId, transactionId);
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.status(200).json({ transaction });
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    /**
     * PATCH /transactions/:id — Update a transaction
     */
    static async updateTransaction(req, res) {
        try {
            const userId = req.user.id;
            const transactionId = req.params.id;
            const updateData = req.body;
            const transaction = await TransactionService.updateTransaction(userId, transactionId, updateData);
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.status(200).json({ transaction });
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    /**
     * DELETE /transactions/:id — Delete a transaction
     */
    static async deleteTransaction(req, res) {
        try {
            const userId = req.user.id;
            const transactionId = req.params.id;
            const transaction = await TransactionService.deleteTransaction(userId, transactionId);
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.status(200).json({ message: 'Transaction deleted successfully' });
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}

module.exports = TransactionController;
