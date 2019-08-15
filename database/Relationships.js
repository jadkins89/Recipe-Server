const connection = require("./connection");

const request = (reqUserId, resUserId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO users_relationships (user_id1, user_id2, status) 
       VALUES (${reqUserId}, ${resUserId}, 1)`,
      (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

const accept = () => {};

const deny = (reqUserId, resUserId) => {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM users_relationships WHERE `);
  });
};

module.exports = {
  request
};
