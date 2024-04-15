const db = require('../../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class UserModel {
    static async getUserByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await db.execute(query, [email]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }

    static async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password);
    }

    static async authenticate(email, password) {
        const user = await this.getUserByEmail(email);
        if (user && (await this.verifyPassword(user, password))) {
            return user;
        } else {
            return null;
        }
    }

    static async createUser(email, username, password) {
        try {
            const rand = Math.floor(Math.random() * 900000) + 100000;
            const userID = uuidv4() + rand;
            const query = 'INSERT INTO users (userID, email, username, password) VALUES (?, ?, ?, ?)';
            const [result] = await db.execute(query, [
                userID,
                email,
                username,
                bcrypt.hashSync(password, 10),
            ]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    static async updateUser(userID, username, password) {
        try {
            const query = 'UPDATE users SET username = ?, password = ? WHERE userID = ?';
            const [result] = await db.execute(query, [username, password, userID]);
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = UserModel;
