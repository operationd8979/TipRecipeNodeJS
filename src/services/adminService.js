const CachingService = require('./cachingService');
const DishModel = require('../models/dishModel');
const IngredientModel = require('../models/ingredientModel');
const TypeModel = require('../models/typeModel');

class AdminService {
    static instance = null;

    constructor() {}

    static getInstance() {
        if (this.instance == null) {
            this.instance = new AdminService();
        }
        return this.instance;
    }

    async getCount(search) {
        return DishModel.getCount(search);
    }

    async getDishsAdmin(search, itemsPerPage, offset) {
        return DishModel.getDishsAdmin(search, itemsPerPage, offset);
    }

    async deleteDish(dishID) {
        return DishModel.deleteDish(dishID);
    }

    async addDish(dishName, summary, recipe, ingredients, types) {
        return DishModel.addDish(dishName, summary, recipe, ingredients, types);
    }

    async updateDishUrl(dishID, url) {
        return DishModel.updateDishUrl(dishID, url);
    }

    async modifyDish(dishID, dishName, summary, recipe, ingredients, types) {
        return DishModel.modifyDish(dishID, dishName, summary, recipe, ingredients, types);
    }
}

module.exports = AdminService;
