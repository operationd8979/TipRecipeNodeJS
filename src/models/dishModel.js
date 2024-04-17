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

    static async getRatingUserOfDish(dishID, userID) {
        try {
            const query =
                'SELECT dishID, rating, predictedRating as preRating, predictionTime as preRatingTime FROM ratings WHERE userID = ? AND dishID = ?';
            const [rows] = await db.execute(query, [userID, dishID]);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async getRatingUserOfDishs(dishIDs, userID) {
        try {
            let query =
                'SELECT dishID, rating, predictedRating as preRating, predictionTime as preRatingTime FROM ratings WHERE userID = ? AND dishID IN (';
            for (let i = 0; i < dishIDs.length; i++) {
                query += '?';
                if (i < dishIDs.length - 1) query += ', ';
            }
            query += ')';
            const [rows] = await db.execute(query, [userID, ...dishIDs]);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async getAverageRating() {
        try {
            const query = 'SELECT dishID, avgRating FROM dishs ORDER BY dishID';
            const [rows] = await db.execute(query);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async getRating() {
        try {
            const query =
                'SELECT u.userID, d.dishID, COALESCE(r.rating, d.avgRating) AS rating FROM users u CROSS JOIN dishs d LEFT JOIN ratings r ON r.userID = u.userID AND r.dishID = d.dishID ORDER BY d.dishID, u.userID';
            const [rows] = await db.execute(query);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async updatePredictedRating(updateQuery) {
        for (let update of updateQuery) {
            let result = await DishModel.checkExitsRating(update.userID, update.dishID);
            if (result) {
                let query =
                    'UPDATE ratings SET predictedRating = ?, predictionTime = NOW() WHERE userID = ? AND dishID = ?';
                await db.execute(query, [update.predictedRating, update.userID, update.dishID]);
            } else {
                let query =
                    'INSERT INTO ratings (userID, dishID, predictedRating, predictionTime) VALUES (?, ?, ?, NOW())';
                await db.execute(query, [update.userID, update.dishID, update.predictedRating]);
            }
        }
    }

    static async checkExitsRating(userID, dishID) {
        try {
            const query =
                'SELECT EXISTS(SELECT 1 FROM ratings WHERE userID = ? AND dishID = ?) AS record_exists';
            const [rows] = await db.execute(query, [userID, dishID]);
            return rows[0].record_exists;
        } catch (err) {
            throw err;
        }
    }

    static async getDetailDishById(dishID) {
        try {
            const query =
                "SELECT d.dishID, d.dishName, d.summary, d.url, GROUP_CONCAT(DISTINCT i.ingredientName ,'@', di.amount,'@', di.unit) as ingredients, GROUP_CONCAT(DISTINCT t.typeName) as types, r.content FROM `dishs` d JOIN `dishingredients` di ON d.dishID = di.dishID JOIN `ingredients` i ON di.ingredientID = i.ingredientID JOIN `dishtypes` dt ON d.dishID = dt.dishID JOIN `typedishs` t ON dt.typeID = t.typeID JOIN `recipes` r ON d.dishID = r.dishID GROUP BY d.dishID HAVING d.dishID = ?";
            const [rows] = await db.execute(query, [dishID]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    }

    static async rateDish(dishID, rating, userID) {
        let result = await DishModel.checkExitsRating(userID, dishID);
        console.log(result);
        if (result) {
            let query =
                'UPDATE ratings SET rating = ?, predictedRating = 0, predictionTime = NULL WHERE userID = ? AND dishID = ?';
            await db.execute(query, [rating, userID, dishID]);
        } else {
            let query =
                'INSERT INTO ratings (userID, dishID, rating, predictedRating, predictionTime) VALUES (?, ?, ?, 0, NULL)';
            await db.execute(query, [userID, dishID, rating]);
        }
    }

    static async updateAvgRating() {
        try {
            const query =
                'UPDATE dishs d LEFT JOIN (SELECT dishID, AVG(rating) AS avgRating FROM ratings GROUP BY dishID) AS avg_ratings ON d.dishID = avg_ratings.dishID SET d.avgRating = avg_ratings.avgRating, d.updatedAt = NOW()';
            await db.execute(query);
        } catch (err) {
            throw err;
        }
    }

    static async getRecommendDishsByUser(userID) {
        const resultRating = await DishModel.getRecommendDishsByUserRating(userID);
        const resultPreRating = await DishModel.getRecommendDishsByUserPreRating(userID);
        let dishs = [...resultRating, ...resultPreRating];
        dishs.sort((a, b) => b.rating - a.rating);
        if (dishs.length < 10) {
            const dishIDs = dishs.map((dish) => dish.dishID);
            const randomDishs = await DishModel.getRandomDishs(dishIDs);
            dishs = [...dishs, ...randomDishs];
        }
        return dishs.slice(0, 10);
    }

    static async getRecommendDishsByUserRating(userID) {
        const query =
            'SELECT d.dishID, d.url, d.dishName, r.rating FROM ratings r LEFT JOIN dishs d ON r.dishID = d.dishID WHERE r.userID = ? ORDER BY rating DESC LIMIT 10';
        const [rows] = await db.execute(query, [userID]);
        return rows;
    }

    static async getRecommendDishsByUserPreRating(userID) {
        const query =
            'SELECT d.dishID, d.url, d.dishName, r.predictedRating as rating FROM ratings r LEFT JOIN dishs d ON r.dishID = d.dishID WHERE r.userID = ? ORDER BY predictedRating DESC LIMIT 10';
        const [rows] = await db.execute(query, [userID]);
        return rows;
    }

    static async getRandomDishs(dishIDs) {
        if (dishIDs.length == 0) {
            const query = 'SELECT dishID, url, dishName FROM dishs ORDER BY RAND() LIMIT 10';
            const [rows] = await db.execute(query);
            return rows;
        }
        let query = 'SELECT dishID, url, dishName FROM dishs WHERE dishID NOT IN (';
        for (let i = 0; i < dishIDs.length; i++) {
            query += '?';
            if (i < dishIDs.length - 1) query += ', ';
        }
        query += ') ORDER BY RAND() LIMIT 10';
        const [rows] = await db.execute(query, dishIDs);
        return rows;
    }

    //admin
    static async getCount(search) {
        try {
            const query = 'SELECT COUNT(*) as total FROM dishs WHERE dishName LIKE ?';
            const [rows] = await db.execute(query, [`%${search}%`]);
            return rows[0].total;
        } catch (err) {
            throw err;
        }
    }

    static async getDishsAdmin(search, itemsPerPage, offset) {
        try {
            let query =
                'SELECT d.dishID, d.dishName, d.summary, d.url, GROUP_CONCAT(DISTINCT i.ingredientName) as ingredients, GROUP_CONCAT(DISTINCT t.typeName) as types FROM `dishs` d JOIN `dishingredients` di ON d.dishID = di.dishID JOIN `ingredients` i ON di.ingredientID = i.ingredientID JOIN `dishtypes` dt ON d.dishID = dt.dishID JOIN `typedishs` t ON dt.typeID = t.typeID WHERE d.isDelete = 0 GROUP BY d.dishID Having d.dishName LIKE ? OR d.dishID LIKE ? LIMIT ? OFFSET ?';
            const [rows] = await db.execute(query, [`%${search}%`, `%${search}%`, itemsPerPage, offset]);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async deleteDish(dishID) {
        try {
            const query = 'UPDATE dishs SET isDelete = 1 WHERE dishID = ?';
            const [rows] = await db.execute(query, [dishID]);
            return rows.affectedRows > 0;
        } catch (err) {
            throw err;
        }
    }

    static async addDish(dishName, summary, recipe, ingredients, types) {
        try {
            const rand = Math.floor(Math.random() * 900000) + 100000;
            const dishID = uuidv4() + rand;
            const query = 'INSERT INTO dishs (dishID, dishName, summary) VALUES (?, ?, ?)';
            await db.execute(query, [dishID, dishName, summary]);
            const query2 = 'INSERT INTO recipes (dishID, content) VALUES (?, ?)';
            await db.execute(query2, [dishID, recipe]);
            for (let ingredient of ingredients) {
                const query3 =
                    'INSERT INTO dishingredients (dishID, ingredientID, amount, unit) VALUES (?, ?, ?, ?)';
                await db.execute(query3, [dishID, ingredient.id, ingredient.amount, ingredient.unit]);
            }
            for (let type of types) {
                const query4 = 'INSERT INTO dishtypes (dishID, typeID) VALUES (?, ?)';
                await db.execute(query4, [dishID, type]);
            }
            return dishID;
        } catch (err) {
            throw err;
        }
    }

    static async updateDishUrl(dishID, url) {
        try {
            const query = 'UPDATE dishs SET url = ? WHERE dishID = ?';
            await db.execute(query, [url, dishID]);
        } catch (err) {
            throw err;
        }
    }

    static async modifyDish(dishID, dishName, summary, recipe, ingredients, types) {
        try {
            const query = 'UPDATE dishs SET dishName = ?, summary = ?, updated_at = NOW() WHERE dishID = ?';
            await db.execute(query, [dishName, summary, dishID]);
            const query2 = 'UPDATE recipes SET content = ? WHERE dishID = ?';
            await db.execute(query2, [recipe, dishID]);
            const query3 = 'DELETE FROM dishingredients WHERE dishID = ?';
            await db.execute(query3, [dishID]);
            for (let ingredient of ingredients) {
                const query4 =
                    'INSERT INTO dishingredients (dishID, ingredientID, amount, unit) VALUES (?, ?, ?, ?)';
                await db.execute(query4, [dishID, ingredient.id, ingredient.amount, ingredient.unit]);
            }
            const query5 = 'DELETE FROM dishtypes WHERE dishID = ?';
            await db.execute(query5, [dishID]);
            for (let type of types) {
                const query6 = 'INSERT INTO dishtypes (dishID, typeID) VALUES (?, ?)';
                await db.execute(query6, [dishID, type]);
            }
        } catch (err) {
            throw err;
        }
    }

    static async updateAvgRating() {
        try {
            const query =
                'UPDATE dishs SET avgRating = (SELECT AVG(rating) FROM ratings WHERE ratings.dishID = dishs.dishID GROUP BY dishID)';
            await db.execute(query);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = DishModel;
