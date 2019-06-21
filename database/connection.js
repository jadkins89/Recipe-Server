const mysql = require('mysql');

// Setup mysql database connection
var keys = require('../config/keys');
var connection = mysql.createConnection({
  host : 'localhost',
  user: keys.mysqlUser,
  password: keys.mysqlPassword,
  database: 'recipe_app'
});

module.exports = connection;