const db = require('../../config/db');

class IngredientModel {
    static async getIngredients() {
        try {
            const query = 'SELECT * FROM ingredients';
            const [rows] = await db.execute(query);
            return rows;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = IngredientModel;
