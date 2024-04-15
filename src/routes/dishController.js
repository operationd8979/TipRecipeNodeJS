const express = require('express');
const router = express.Router();
const DishService = require('../services/dishService');
const responseInit = require('../helpers/responseInit');
const { INTERNAL_SERVER_ERROR, NOT_FOUND_ERROR } = require('../contants/errorResponse');

router.post('/', async function (req, res, next) {
    try {
        let { search, ingredients, types, itemsPerPage, offset } = req.body;
        if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
        if (typeof types === 'string') types = JSON.parse(types);
        let dishs = await DishService.getInstance().getDishs(
            search,
            ingredients,
            types,
            itemsPerPage,
            offset,
        );
        dishs = await DishService.getInstance().implementRating(dishs, req.user.userID);
        responseInit.InitRes(res, 200, dishs);
    } catch (err) {
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.get('/', async function (req, res, next) {
    try {
        const dishID = req.query.id;
        const dish = await DishService.getInstance().getDetailDishById(dishID);
        if (!dish) {
            responseInit.InitRes(res, NOT_FOUND_ERROR.code, NOT_FOUND_ERROR.message);
            return;
        }
        responseInit.InitRes(res, 200, dish);
    } catch (err) {
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.post('/rating', async function (req, res, next) {
    try {
        const { dishID, rating } = req.body;
        await DishService.getInstance().rateDish(dishID, rating / 10, req.user.userID);
        responseInit.InitRes(res, 200, 'Rating success');
    } catch (err) {
        console.log(err);
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.get('/ingredients', async function (req, res, next) {
    try {
        const ingredients = await DishService.getInstance().getIngredients();
        responseInit.InitRes(res, 200, ingredients);
    } catch (err) {
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.get('/types', async function (req, res, next) {
    try {
        const types = await DishService.getInstance().getTypes();
        responseInit.InitRes(res, 200, types);
    } catch (err) {
        console.log(err);
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.get('/getRecommendDish', async function (req, res, next) {
    try {
        const dishs = await DishService.getInstance().getRecommendDishsByUser(req.user.userID);
        responseInit.InitRes(res, 200, dishs);
    } catch (err) {
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.get('/getRatingDish', async function (req, res, next) {
    try {
        const dishID = req.query.id;
        const rating = await DishService.getInstance().getRatingUserOfDish(dishID, req.user.userID);
        responseInit.InitRes(res, 200, rating);
    } catch (err) {
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

module.exports = router;
