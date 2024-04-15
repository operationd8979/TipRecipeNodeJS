const express = require('express');
const router = express.Router();

router.use('/auth', require('./authController'));
router.use('/user', require('./userController'));
router.use('/dish', require('./dishController'));

module.exports = router;
