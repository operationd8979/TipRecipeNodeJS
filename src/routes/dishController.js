const express = require('express');
const router = express.Router();
const DishService = require('../services/dishService');
const responseInit = require('../helpers/responseInit');
const { INTERNAL_SERVER_ERROR } = require('../contants/errorResponse');

router.post('/', async function (req, res, next) {
    try {
        const { search, ingredients, types, itemsPerPage, offset } = req.body;
        const dishs = await DishService.getInstance().getDishs(
            search,
            ingredients,
            types,
            itemsPerPage,
            offset,
        );
        responseInit.InitRes(res, 200, dishs);
    } catch (err) {
        responseInit.InitRes(res, 500, INTERNAL_SERVER_ERROR);
    }
});

module.exports = router;
