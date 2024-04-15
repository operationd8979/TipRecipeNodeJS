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
const bcrypt = require('bcrypt');

router.get('/getInfo', async function (req, res, next) {
    const user = req.user;
    if (user) {
        responseInit.InitRes(res, 200, { email: user.email, username: user.username, role: user.role });
    } else {
        responseInit.InitRes(res, USER_NOT_FOUND.code, USER_NOT_FOUND.message);
    }
});

router.post(
    '/update',
    userValidator.checkUsername(),
    userValidator.checkPassword(),
    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            for (let error of errors.array()) {
                if (req.body[error.path] !== '') {
                    responseInit.InitRes(res, INVALID_VALUE.code, errors.array().at(0).msg);
                    return;
                }
            }
        }
        let { username, password } = req.body;
        const user = req.user;
        username = username || user.username;
        password = password ? bcrypt.hashSync(password, 10) : user.password;
        try {
            const result = await UserService.getInstance().updateUser(user.userID, username, password);
            if (result.affectedRows > 0) {
                responseInit.InitRes(res, 200, { email: user.email, username: username, role: user.role });
            } else {
                responseInit.InitRes(res, INVALID_REQUEST.code, INVALID_REQUEST.message);
            }
        } catch (error) {
            responseInit.InitRes(res, INTERNAL_SERVER_ERROR.code, INTERNAL_SERVER_ERROR.message);
        }
    },
);

module.exports = router;
