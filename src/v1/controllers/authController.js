//user careate login and register controller with jwt authentication
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// i have services and models and modelhelpers folder so i have to distcrubute logic accordinglt
const UserService = require('../services/authService');

class AuthController {
    static async register(req, res) {
        try {
            const { email, password, name, role, username } = req.body;
            const userInfo = { email, password, name, role, username };
            console.log("userInfo", userInfo);
            const user = await UserService.createUser(userInfo);
            console.log("user", user);
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(201).json({ user, token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const loginInfo = { username, password };
            const userResponse = await UserService.validateUser(loginInfo);
            if (!userResponse) {
                return res.status(404).json({ userResponse });
            }
            res.status(200).json(userResponse);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = AuthController;
