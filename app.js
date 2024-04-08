var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const credentials = require("./config/credentials");

mongoose
  .connect(credentials.mongo.development.connectionString)
  .then(function () {
    console.log("conneted");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const { ppid } = require("process");

var app = express();

//Enable CORS Requests
var corsOptions = {
  origin: "http://localhost:3000/",
  optionsSuccessStatus: 200,
};

// enable pre-flight request for DELETE request
// app.options('/products/:id', cors())
// app.del('/products/:id', cors(), function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })

app.use(cors(corsOptions));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;
