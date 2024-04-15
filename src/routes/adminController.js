const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const responseInit = require('../helpers/responseInit');
const userValidator = require('../validators/userValidator');
const { validationResult } = require('express-validator');
const {
    USER_NOT_FOUND,
    INTERNAL_SERVER_ERROR,
    INVALID_REQUEST,
    INVALID_VALUE,
} = require('../contants/errorResponse');

router.get('/test', async function (req, res, next) {
    responseInit.InitRes(res, 200, 'Admin test');
});

module.exports = router;
