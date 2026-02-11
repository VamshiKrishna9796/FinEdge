//createmodel helper functions for user model
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

class UserModelHelper {
    static async createUser(userInfo) {
        const user = new User(userInfo);
        return await user.save();
    }

    static async getUserByUsername(username) {
        return await User.findOne({ username });
    }

    static async comparePasswords(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    static async generateAuthToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }
}

module.exports = UserModelHelper;
