// Transaction service — handles business logic for transactions
// Includes auto-categorization via keyword matching and filtering by date/category
const TransactionModelHelper = require('../../modelHelpers/transactionModelHelper');

// Keyword-to-category mapping for auto-categorization
const CATEGORY_KEYWORDS = {
    'food': ['restaurant', 'pizza', 'burger', 'coffee', 'cafe', 'lunch', 'dinner', 'breakfast', 'grocery', 'groceries', 'food', 'eat', 'meal', 'snack', 'bakery', 'swiggy', 'zomato'],
    'transport': ['uber', 'ola', 'cab', 'taxi', 'bus', 'train', 'metro', 'fuel', 'petrol', 'diesel', 'gas', 'parking', 'toll', 'flight', 'airline', 'travel'],
    'entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'theatre', 'theater', 'music', 'subscription', 'amazon prime', 'youtube', 'disney'],
    'shopping': ['amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'electronics', 'gadget', 'phone', 'laptop', 'mall', 'shop', 'purchase', 'buy'],
    'bills': ['electricity', 'electric', 'water', 'internet', 'wifi', 'phone bill', 'mobile bill', 'recharge', 'rent', 'emi', 'loan', 'insurance', 'tax'],
    'health': ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'gym', 'fitness', 'health', 'clinic', 'dental', 'eye'],
    'education': ['course', 'book', 'tuition', 'school', 'college', 'university', 'udemy', 'coursera', 'tutorial', 'class', 'exam', 'study'],
    'salary': ['salary', 'payroll', 'wages', 'stipend', 'bonus', 'incentive', 'commission'],
    'freelance': ['freelance', 'project', 'contract', 'consulting', 'gig', 'client payment'],
    'investment': ['dividend', 'interest', 'mutual fund', 'stock', 'investment', 'return', 'profit', 'fd', 'fixed deposit']
};

class TransactionService {
    /**
     * Auto-categorize a transaction based on its description using keyword matching
     * Returns the matched category or 'other' if no match found
     */
    static autoCategorize(description) {
        if (!description) return 'other';
        const lowerDesc = description.toLowerCase();

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            for (const keyword of keywords) {
                if (lowerDesc.includes(keyword)) {
                    return category;
                }
            }
        }
        return 'other';
    }

    /**
     * Create a new transaction
     * If no category is provided, auto-categorize based on description
     */
    static async createTransaction(userId, transactionData) {
        // Auto-categorize if category is not provided or is 'auto'
        if (!transactionData.category || transactionData.category === 'auto') {
            transactionData.category = TransactionService.autoCategorize(transactionData.description);
        }

        const transaction = {
            userId,
            type: transactionData.type,
            category: transactionData.category,
            amount: transactionData.amount,
            description: transactionData.description || '',
            date: transactionData.date || new Date()
        };

        return await TransactionModelHelper.createTransaction(transaction);
    }

    /**
     * Get all transactions for a user with optional filters (date, category, type)
     */
    static async getTransactions(userId, filters = {}) {
        return await TransactionModelHelper.getTransactionsByUserId(userId, filters);
    }

    /**
     * Get a single transaction by ID — ensures the transaction belongs to the user
     */
    static async getTransactionById(userId, transactionId) {
        const transaction = await TransactionModelHelper.getTransactionById(transactionId);
        if (!transaction) {
            return null;
        }
        // Ensure the transaction belongs to the requesting user
        if (transaction.userId.toString() !== userId.toString()) {
            const error = new Error('Forbidden: You do not own this transaction');
            error.statusCode = 403;
            throw error;
        }
        return transaction;
    }

    /**
     * Update a transaction by ID — ensures ownership before updating
     */
    static async updateTransaction(userId, transactionId, updateData) {
        const transaction = await TransactionModelHelper.getTransactionById(transactionId);
        if (!transaction) {
            return null;
        }
        if (transaction.userId.toString() !== userId.toString()) {
            const error = new Error('Forbidden: You do not own this transaction');
            error.statusCode = 403;
            throw error;
        }

        // Re-categorize if description is being updated and category isn't explicitly set
        if (updateData.description && !updateData.category) {
            updateData.category = TransactionService.autoCategorize(updateData.description);
        }

        return await TransactionModelHelper.updateTransaction(transactionId, updateData);
    }

    /**
     * Delete a transaction by ID — ensures ownership before deleting
     */
    static async deleteTransaction(userId, transactionId) {
        const transaction = await TransactionModelHelper.getTransactionById(transactionId);
        if (!transaction) {
            return null;
        }
        if (transaction.userId.toString() !== userId.toString()) {
            const error = new Error('Forbidden: You do not own this transaction');
            error.statusCode = 403;
            throw error;
        }
        return await TransactionModelHelper.deleteTransaction(transactionId);
    }
}

module.exports = TransactionService;
