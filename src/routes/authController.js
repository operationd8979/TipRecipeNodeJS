const express = require('express');
const router = express.Router();
const JwtService = require('../services/jwtService');
const UserService = require('../services/userService');
const responseInit = require('../helpers/responseInit');
const userValidator = require('../validators/userValidator');
const { validationResult } = require('express-validator');
const {
    INVALID_CREDENTIALS,
    INTERNAL_SERVER_ERROR,
    INVALID_VALUE,
    EMAIL_ALREADY_EXISTS,
    INVALID_REQUEST,
} = require('../contants/errorResponse');

router.post('/login', async function (req, res, next) {
    try {
        const { email, password } = req.body;
        let user = await UserService.getInstance().authenticate(email, password);
        if (user) {
            let jwtService = JwtService.getInstance();
            let token = jwtService.generateToken(user.email);
            res.cookie('token', token, { expires: new Date(Date.now() + 24 * 3600 * 1000), httpOnly: true });
            responseInit.InitRes(res, 200, { email, username: user.username, role: user.role });
        } else {
            responseInit.InitRes(res, INVALID_CREDENTIALS.code, INVALID_CREDENTIALS.message);
        }
    } catch (error) {
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

router.post('/register', userValidator.checkChain(), async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return responseInit.InitRes(res, INVALID_VALUE.code, errors.array().at(0).msg);
    }
    try {
        const { email, password, username } = req.body;
        let user = await UserService.getInstance().getUserByEmail(email);
        if (user) {
            return responseInit.InitRes(res, EMAIL_ALREADY_EXISTS.code, EMAIL_ALREADY_EXISTS.message);
        }
        let result = await UserService.getInstance().createUser(email, username, password);
        if (result.affectedRows > 0) {
            let jwtService = JwtService.getInstance();
            let token = jwtService.generateToken(email);
            res.cookie('token', token, { expires: new Date(Date.now() + 24 * 3600 * 1000), httpOnly: true });
            responseInit.InitRes(res, 201, { email, username, role: 'USER' });
        } else {
            responseInit.InitRes(res, INVALID_REQUEST.code, INVALID_REQUEST.message);
        }
    } catch (error) {
        responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
    }
});

module.exports = router;
