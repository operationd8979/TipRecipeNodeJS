const express = require('express');
const router = express.Router();

router.use('/auth', require('./authController'));
router.use('/user', require('./userController'));
router.use('/dish', require('./dishController'));
router.use('/admin', require('./adminController'));

module.exports = router;
