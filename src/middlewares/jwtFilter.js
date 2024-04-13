const config = require('../../config/config');
const configRoutes = require('../../config/configRoutes');
const userModel = require('../models/userModel');
const responseInit = require('../helpers/responseInit');
const errorResponse = require('../contants/errorResponse');
const JwtService = require('../services/jwtService');
const con = require('../../config/db');

module.exports = async function (req, res, next) {
    if (configRoutes.WHITE_URL.some((url) => req.originalUrl.includes(url))) {
        next();
        return;
    }
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        if (req.cookies.token) {
            token = req.cookies.token;
        }
    }
    if (token) {
        try {
            const jwtService = JwtService.getInstance();
            let email = jwtService.verifyToken(token);
            if (email) {
                let user = await userModel.getUserByEmail(email);
                if (user) {
                    let role = user.role;
                    if (configRoutes.USER_URL.some((url) => req.path.includes(url)) && role === 'USER') {
                        req.user = user;
                        next();
                        return;
                    }
                    if (configRoutes.ADMIN_URL.some((url) => req.path.includes(url)) && role === 'ADMIN') {
                        req.user = user;
                        next();
                        return;
                    }
                }
            }
        } catch (error) {
            responseInit.InitRes(
                res,
                errorResponse.FORBIDDEN_ERROR.code,
                errorResponse.FORBIDDEN_ERROR.message,
            );
        }
    }
    responseInit.InitRes(res, errorResponse.FORBIDDEN_ERROR.code, errorResponse.FORBIDDEN_ERROR.message);
};
