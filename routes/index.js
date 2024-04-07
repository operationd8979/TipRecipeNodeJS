var express = require("express");
const path = require("path");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("hellllllllllllo");
});

// router.get("/about", function (req, res) {
//   res.render("about", {
//     fortune: fortune.getFortune(),
//     pageTestScript: "/qa/tests-about.js",
//   });
// });

module.exports = router;
