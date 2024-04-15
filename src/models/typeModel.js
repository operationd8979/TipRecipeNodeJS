const db = require('../../config/db');

class TypeModel {
    static async getTypes() {
        try {
            const query = 'SELECT * FROM typedishs';
            const [rows] = await db.execute(query);
            return rows;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = TypeModel;
