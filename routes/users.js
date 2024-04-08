var express = require('express');
const User = require("../models/user");
var router = express.Router();


router.get('/', async function(req, res, next) {
  res.json(await User.getUser());
});

router.get('/add', function(req, res){
  res.type('text/plain');
  res.send('heloo');
})

module.exports = router;
