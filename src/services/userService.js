const UserModel = require('../models/userModel');

class UserService {
    static instance = null;

    constructor() {}

    static getInstance() {
        if (this.instance == null) {
            this.instance = new UserService();
        }
        return this.instance;
    }

    async getUserByEmail(email) {
        return UserModel.getUserByEmail(email);
    }

    async createUser(email, username, password) {
        return UserModel.createUser(email, username, password);
    }

    async authenticate(email, password) {
        return UserModel.authenticate(email, password);
    }

    async updateUser(userID, username, password) {
        return UserModel.updateUser(userID, username, password);
    }
}

module.exports = UserService;
