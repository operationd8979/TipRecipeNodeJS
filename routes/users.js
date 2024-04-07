var express = require('express');
var router = express.Router();

var tours = [
  {
    id: 0, name: 'bb'
  },
  {
    id:1, name: 'aaa'
  }
]

router.get('/', function(req, res, next) {
  res.json(tours);
});

router.get('/add', function(req, res){
  res.type('text/plain');
  res.send('heloo');
})

module.exports = router;
