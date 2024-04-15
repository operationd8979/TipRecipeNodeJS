const db = require('../../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class DishModel {
    static async getDishById(dishID) {
        try {
            const query = 'SELECT * FROM dishs WHERE dishID = ?';
            const [rows] = await db.execute(query, [dishID]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }

    static async getDishs(search, ingredients, types, itemsPerPage, offset) {
        try {
            let query =
                'SELECT d.dishID, d.dishName, d.summary, d.url, GROUP_CONCAT(DISTINCT i.ingredientName) as ingredients, GROUP_CONCAT(DISTINCT t.typeName) as types FROM `dishs` d JOIN `dishingredients` di ON d.dishID = di.dishID JOIN `ingredients` i ON di.ingredientID = i.ingredientID JOIN `dishtypes` dt ON d.dishID = dt.dishID JOIN `typedishs` t ON dt.typeID = t.typeID WHERE d.isDelete = 0 GROUP BY d.dishID Having d.dishName LIKE ? ';
            if (ingredients.length > 0) {
                query += ' and d.dishID IN (SELECT dishID FROM dishingredients WHERE ingredientID IN (';
                query += ingredients.join(',');
                query += ') GROUP BY dishID HAVING COUNT(DISTINCT ingredientID) = ';
                query += ingredients.length;
                query += ')';
            }
            if (types.length > 0) {
                query += ' and d.dishID IN (SELECT dishID FROM dishtypes WHERE typeID IN (';
                query += types.join(',');
                query += '))';
            }
            query += ' LIMIT ? OFFSET ?';
            const [rows] = await db.execute(query, [`%${search}%`, itemsPerPage, offset]);
            return rows;
        } catch (err) {
            throw err;
        }
    }
}
module.exports = DishModel;
