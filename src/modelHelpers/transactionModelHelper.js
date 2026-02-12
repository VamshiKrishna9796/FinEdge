// Model helper functions for Transaction model — handles all direct DB operations
const Transaction = require('../models/transactionModel');

class TransactionModelHelper {
    /**
     * Create a new transaction document in MongoDB
     */
    static async createTransaction(transactionData) {
        const transaction = new Transaction(transactionData);
        return await transaction.save();
    }

    /**
     * Get all transactions for a user with optional filters
     */
    static async getTransactionsByUserId(userId, filters = {}) {
        const query = { userId };

        // Filter by category
        if (filters.category) {
            query.category = { $regex: new RegExp(filters.category, 'i') };
        }

        // Filter by type (income/expense)
        if (filters.type) {
            query.type = filters.type;
        }

        // Filter by date range
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) {
                query.date.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.date.$lte = new Date(filters.endDate);
            }
        }

        return await Transaction.find(query).sort({ date: -1 });
    }

    /**
     * Get a single transaction by ID
     */
    static async getTransactionById(transactionId) {
        return await Transaction.findById(transactionId);
    }

    /**
     * Update a transaction by ID (partial update)
     */
    static async updateTransaction(transactionId, updateData) {
        return await Transaction.findByIdAndUpdate(
            transactionId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
    }

    /**
     * Delete a transaction by ID
     */
    static async deleteTransaction(transactionId) {
        return await Transaction.findByIdAndDelete(transactionId);
    }
}

module.exports = TransactionModelHelper;
