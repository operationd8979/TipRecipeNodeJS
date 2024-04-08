const mysql = require('mysql2/promise');
const credentials = require('../credentials');

const access = {
    host: credentials.sql.hostname,
    user: credentials.sql.user,
    password: credentials.sql.password,
    database: credentials.sql.database
};  
const con = mysql.createPool(access);

module.exports = con;

// var mongoose = require("mongoose");

// mongoose
//   .connect(credentials.mongo.development.connectionString)
//   .then(function () {
//     console.log("conneted");
//   })
//   .catch((error) => {
//     console.error("Error connecting to MongoDB:", error);
//   });
// module.exports = mongoose.connection;
