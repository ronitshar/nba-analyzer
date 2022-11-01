const mysql = require("mysql2");

module.exports = mysql.createConnection({
    host: "35.224.9.241",
    user: "root",
    password: "boonkgang",
    database: "nbaanalyzer"
});