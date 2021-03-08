const mysql = require("mysql");
const config = require("./keys");

module.exports = mysql.createPool({
    host: config.mysqlHost,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDB,
    multipleStatements: true
});

