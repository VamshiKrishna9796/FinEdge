//userSchema defines the structure of user documents in MongoDB using Mongoose.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);