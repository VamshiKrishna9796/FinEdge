const http = require("http");
const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/mongoDbConfig');
dotenv.config();

const port = process.env.PORT || 3000;
(async () => {
    await connectDB();
    http.createServer(app).listen(port, () => {
        console.log('Application started on ' + port);
    });
})();