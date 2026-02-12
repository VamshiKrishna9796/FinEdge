// Transaction validation middleware — validates request body for transaction operations

/**
 * Validate the request body for creating a new transaction
 */
const validateCreateTransaction = (req, res, next) => {
    const { type, amount, description, date } = req.body;
    const errors = [];

    // Type validation
    if (!type) {
        errors.push('type is required');
    } else if (!['income', 'expense'].includes(type)) {
        errors.push('type must be either "income" or "expense"');
    }

    // Amount validation
    if (amount === undefined || amount === null) {
        errors.push('amount is required');
    } else if (typeof amount !== 'number' || isNaN(amount)) {
        errors.push('amount must be a valid number');
    } else if (amount <= 0) {
        errors.push('amount must be greater than 0');
    }

    // Date validation (optional field)
    if (date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            errors.push('date must be a valid date');
        }
    }

    // Description validation (optional but should be string)
    if (description !== undefined && typeof description !== 'string') {
        errors.push('description must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

/**
 * Validate the request body for updating a transaction (PATCH — partial update)
 */
const validateUpdateTransaction = (req, res, next) => {
    const { type, amount, description, date, category } = req.body;
    const errors = [];

    // At least one field must be provided for update
    if (!type && amount === undefined && !description && !date && !category) {
        errors.push('At least one field must be provided for update');
    }

    // Type validation (optional in update)
    if (type && !['income', 'expense'].includes(type)) {
        errors.push('type must be either "income" or "expense"');
    }

    // Amount validation (optional in update)
    if (amount !== undefined) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            errors.push('amount must be a valid number');
        } else if (amount <= 0) {
            errors.push('amount must be greater than 0');
        }
    }

    // Date validation (optional in update)
    if (date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            errors.push('date must be a valid date');
        }
    }

    // Description validation (optional in update)
    if (description !== undefined && typeof description !== 'string') {
        errors.push('description must be a string');
    }

    // Category validation (optional in update)
    if (category !== undefined && typeof category !== 'string') {
        errors.push('category must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

/**
 * Validate MongoDB ObjectId format for route params
 */
const validateTransactionId = (req, res, next) => {
    const { id } = req.params;
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(id)) {
        return res.status(400).json({ error: 'Invalid transaction ID format' });
    }

    next();
};

module.exports = {
    validateCreateTransaction,
    validateUpdateTransaction,
    validateTransactionId
};
