const mysql = require('mysql2/promise');
const config = require('./config');

const access = {
    host: config.sql.hostname,
    user: config.sql.user,
    password: config.sql.password,
    database: config.sql.database,
};
const con = mysql.createPool(access);

module.exports = con;
