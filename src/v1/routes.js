const express = require('express');
const router = express.Router();
const authenticate = require('./controllers/authController');
const transactionController = require('./controllers/transactionController');
const jwtAuthentication = require("../middlewares/authenticationMiddleware");
const {
    validateCreateTransaction,
    validateUpdateTransaction,
    validateTransactionId
} = require('../middlewares/transactionValidation');

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'API is running' });
});

// Auth routes
router.post('/users/signup', authenticate.register);
router.post('/users/login', authenticate.login);
router.get('/protected', jwtAuthentication, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Transaction routes (all protected with JWT)
router.post('/transactions', jwtAuthentication, validateCreateTransaction, transactionController.createTransaction);
router.get('/transactions', jwtAuthentication, transactionController.getTransactions);
router.get('/transactions/:id', jwtAuthentication, validateTransactionId, transactionController.getTransactionById);
router.patch('/transactions/:id', jwtAuthentication, validateTransactionId, validateUpdateTransaction, transactionController.updateTransaction);
router.delete('/transactions/:id', jwtAuthentication, validateTransactionId, transactionController.deleteTransaction);

module.exports = router;