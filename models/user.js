const db = require("../config/db");

class User {
  static async createUser(userData) {
    try {
        const query = `INSERT INTO user(username, email, passwordHash, role) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [userData.username, userData.email, userData.password, userData.role]);
        console.log(result.insertId);
        return result.insertId; 
    } catch (err) {
        throw err;
    }
  }

  static async getUser() {
    try {
      const query = "SELECT * FROM USER";
      const [rows] = await db.execute(query);
      console.log(rows);
      return rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = User;
