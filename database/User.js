const connection = require('./connection');

module.exports = {
  findOne: function(email) {
    return new Promise(function(resolve, reject) {
      connection.query('SELECT * FROM users WHERE email = ?', 
      email, 
      (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  },
  findById: function(id) {
    return new Promise(function(resolve, reject) {
      connection.query(
        'SELECT * FROM users WHERE id = ?',
        id,
        (error, results, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        });
    });
  },
  create: function(newUser) {
    return new Promise(function(resolve, reject) {
      connection.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', 
        [newUser.first_name, newUser.last_name, newUser.email, newUser.password],
        (error, results, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
  }
}