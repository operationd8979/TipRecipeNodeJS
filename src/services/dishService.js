const DishModel = require('../models/dishModel');

class DishService {
    static instance = null;

    constructor() {}

    static getInstance() {
        if (this.instance == null) {
            this.instance = new DishService();
        }
        return this.instance;
    }

    async getDishs(search, ingredients, types, itemsPerPage, offset) {
        return DishModel.getDishs(search, ingredients, types, itemsPerPage, offset);
    }

    async getDishById(dishId) {
        return DishModel.getDishById(dishId);
    }
}

module.exports = DishService;
