const express = require('express');
const router = express.Router();
const authenticate = require('./controllers/authController');
const  jwtAuthentication  = require("../middlewares/authenticationMiddleware");
const aggregateNewsController = require('./controllers/aggregateNewsController');
// Sample route
router.get('/health', (req, res) => {
    res.json({ status: 'API is running' });
});
router.post('/users/signup', authenticate.register);
router.post('/users/login', authenticate.login);
router.get('/protected', jwtAuthentication, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});
// router.get('/news', jwtAuthentication, aggregateNewsController.aggregateNews);
module.exports = router;