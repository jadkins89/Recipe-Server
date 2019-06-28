const connection = require("./connection");

function addRecipe(name) {
  name = name.replace("'", "''");
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO recipes (name) VALUES ('${name}')`,
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

function addTime(id, time) {
  if (!id) {
    return Promise.reject();
  }
  const { prep, cook, active, inactive, total, ready } = time;
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO time (id, prep, cook, active, inactive, total, ready) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, prep, cook, active, inactive, total, ready],
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

function addArrayItem(id, tableName, array) {
  var colName = tableName.slice(0, -1);
  var query = `INSERT INTO ${tableName} (order_id, ${colName}, recipe_id) VALUES `;
  array.forEach((item, index) => {
    item = item.replace("'", "''");
    query += `(${index}, '${item}', ${id}), `;
  });
  query = query.slice(0, -2);
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  create: function(recipe) {
    const { name, time, ingredients, instructions } = recipe;
    return new Promise(function(resolve, reject) {
      addRecipe(name)
        .then(res => {
          console.log(res.insertId);
          Promise.all([
            addTime(res.insertId, time),
            addArrayItem(res.insertId, "ingredients", ingredients),
            addArrayItem(res.insertId, "instructions", instructions)
          ])
            .then(results => {
              resolve(results);
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  findByUser: function() {},
  findById: function() {}
};
