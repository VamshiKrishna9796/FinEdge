const express = require("express");
const routes = require('./routes');
const corsMiddleware = require('./middlewares/corsMiddleware');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

app.use(corsMiddleware());
app.use(rateLimiter());
app.use(express.json());
app.use('/api', routes);
console.log('app loaded');

module.exports = app;
