const connection = require("./connection");

module.exports = {
  create,
  findById
};

function create(recipe, user_id) {
  const { name, time, ingredients, instructions } = recipe;
  return new Promise(function(resolve, reject) {
    addRecipe(name)
      .then(res => {
        Promise.all([
          addTime(res.insertId, time),
          addArrayItem(res.insertId, "ingredients", ingredients),
          addArrayItem(res.insertId, "instructions", instructions),
          addUsersRecipes(user_id, res.insertId)
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
}

function findByUser() {}

function findById(id) {
  let recipe = {};
  return Promise.all([
    getById(id),
    getArrayItem(id, "ingredients"),
    getArrayItem(id, "instructions")
  ])
    .then(results => {
      console.log(results);
      resolve(results);
    })
    .catch(error => {
      reject(error);
    });
  // return new Promise((resolve, reject) => {
  //   connection.query(
  //     `SELECT * FROM recipes WHERE recipes.id=${id}`,
  //     (error, results, fields) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         recipe.name = results[0].name;
  //         connection.query(
  //           `SELECT order_id, instruction FROM instructions WHERE recipe_id=${id}`,
  //           (error, results, fields) => {
  //             if (error) {
  //               reject(error);
  //             } else {
  //               results.sort((a, b) => {
  //                 return b.order_id - a.order_id;
  //               });
  //               recipe.instructions = results.map(item => {
  //                 return item.instruction;
  //               });
  //               console.log(recipe);
  //             }
  //           }
  //         );
  //         resolve(results);
  //       }
  //     }
  //   );
  // });
}

// Utility Functions
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

function addUsersRecipes(user_id, recipe_id) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO users_recipes VALUES (${user_id}, ${recipe_id})`,
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

function getArrayItem(recipe_id, tableName) {
  var itemName = tableName.slice(0, -1);
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT order_id, ${itemName} FROM ${tableName} WHERE recipe_id=${recipe_id}`,
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

function getById(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM recipes WHERE recipes.id=${id}`,
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
