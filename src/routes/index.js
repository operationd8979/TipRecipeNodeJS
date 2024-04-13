const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');

router.get('/', function (req, res, next) {
    UserModel.getUserByEmail('operationddd@gmail.com')
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            res.json(err);
        });
});

module.exports = router;
