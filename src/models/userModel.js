const db = require('../../config/db');
const bcrypt = require('bcrypt');

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
        const userID = uniqid().rand(100000, 999999);
        const query =
            'INSERT INTO users (userID, email, username, password) VALUES (?, ?, ?, ?)';
        const [rows] = await db.execute(query, [
            userID,
            email,
            username,
            bcrypt.hashSync(password, 10),
        ]);
        return rows;
    }

    static async updateUser(userID, username, email, password) {
        //check
        const query =
            'UPDATE users SET username = ?, email = ?, password = ? WHERE userID = ?';
        const [rows] = await db.execute(query, [
            username,
            email,
            bcrypt.hashSync(password, 10),
            userID,
        ]);
        return rows;
    }
}

module.exports = UserModel;
