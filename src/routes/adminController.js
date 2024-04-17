const express = require('express');
const router = express.Router();
const AdminService = require('../services/adminService');
const responseInit = require('../helpers/responseInit');
const userValidator = require('../validators/userValidator');
const { validationResult } = require('express-validator');
const {
    NOT_FOUND_ERROR,
    INTERNAL_SERVER_ERROR,
    INVALID_REQUEST,
    INVALID_VALUE,
} = require('../contants/errorResponse');

router.get('/test', async function (req, res, next) {
    responseInit.InitRes(res, 200, 'Admin test');
});

router.post('/getDishs', async function (req, res, next) {
    try {
        const search = req.body.search || '';
        const itemsPerPage = req.body.itemsPerPage || 10;
        const offset = req.body.offset || 0;
        const total = await AdminService.getInstance().getCount(search);
        const dishs = await AdminService.getInstance().getDishsAdmin(search, itemsPerPage, offset);
        return responseInit.InitRes(res, 200, { total, dishs });
    } catch (err) {
        return responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.get('/delete', async function (req, res, next) {
    try {
        const dishID = req.query.id;
        const result = await AdminService.getInstance().deleteDish(dishID);
        if (!result) {
            return responseInit.InitRes(res, NOT_FOUND_ERROR.code, NOT_FOUND_ERROR.message);
        }
        return responseInit.InitRes(res, 200, 'Delete success');
    } catch (err) {
        console.log(err);
        return responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.post('/addDish', async function (req, res, next) {
    try {
        let { dishName, summary, recipe, ingredients, types } = req.body;
        if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
        if (typeof types === 'string') types = JSON.parse(types);
        const result = await AdminService.getInstance().addDish(
            dishName,
            summary,
            recipe,
            ingredients,
            types,
        );
        return responseInit.InitRes(res, 200, result);
    } catch (err) {
        return responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.post('/updateUrl', async function (req, res, next) {
    try {
        const { dishID, url } = req.body;
        const result = await AdminService.getInstance().updateDishUrl(dishID, url);
        return responseInit.InitRes(res, 200, result);
    } catch (err) {
        return responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.post('/modifyDish', async function (req, res, next) {
    try {
        let { dishID, dishName, summary, recipe, ingredients, types } = req.body;
        if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
        if (typeof types === 'string') types = JSON.parse(types);
        const result = await AdminService.getInstance().modifyDish(
            dishID,
            dishName,
            summary,
            recipe,
            ingredients,
            types,
        );
        return responseInit.InitRes(res, 200, result);
    } catch (err) {
        return responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

module.exports = router;
