const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const jwtFilter = require('./src/middlewares/jwtFilter');

var corsOptions = {
    origin: 'http://10.0.20.141:3000',
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', jwtFilter);
app.use('/api/v1', require('./src/routes/index'));

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.send({
        success: false,
        message: err.message,
    });
});

module.exports = app;
