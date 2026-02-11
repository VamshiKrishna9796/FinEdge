//authservice file for version 1
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModelHelper = require('../../modelHelpers/userModelHelper');
class AuthService {
    static async createUser(userInfo) {
        const hashedPassword = await bcrypt.hash(userInfo.password, 10);
        const userObject = { 
            email: userInfo.email,
            password: hashedPassword,
            name: userInfo.name,
            role: userInfo.role,
            username: userInfo.username
        };
        const user = await UserModelHelper.createUser(userObject);
        return user;
    }
    static async validateUser(loginInfo) {
        const user = await UserModelHelper.getUserByUsername(loginInfo.username);
        //create an object with user and token
        console.log("user", user);
        const userObject = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            username: user.username,
            token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        }
        if (!user) {
            return null;
        }
        const isMatch = await bcrypt.compare(loginInfo.password, user.password);
        if (!isMatch) {
            return null;
        }
        return userObject;
    }
}

module.exports = AuthService;