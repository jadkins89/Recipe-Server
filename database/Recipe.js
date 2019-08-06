const connection = require("./connection");

module.exports = {
  create,
  findOneById,
  findByUserId,
  findFavorites
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

function findOneById(id) {
  let recipe = {};
  return new Promise((resolve, reject) => {
    Promise.all([
      getOneById(id, "recipes"),
      getOneById(id, "time"),
      getArrayItem(id, "ingredients"),
      getArrayItem(id, "instructions")
    ])
      .then(results => {
        results.map(item => {
          Object.assign(recipe, item);
        });
        resolve(recipe);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function findByUserId(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT id, name FROM users_recipes 
       JOIN recipes ON users_recipes.Recipes_id=recipes.id 
       WHERE Users_id=${id}`,
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

function findFavorites(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT id, name FROM users_recipes 
       JOIN recipes ON users_recipes.Recipes_id=recipes.id 
       WHERE Users_id=${id} AND favorite=1`,
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

function addUsersRecipes(user_id, recipe_id, favorite) {
  if (!favorite) {
    favorite = false;
  }
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO users_recipes VALUES (${user_id}, ${recipe_id}, ${favorite})`,
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
          results.sort((a, b) => {
            return b.order_id - a.order_id;
          });
          let items = [];
          results.map(item => {
            items.push(item[itemName]);
          });
          resolve({ [tableName]: items });
        }
      }
    );
  });
}

function getOneById(id, tableName) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM ${tableName} WHERE id=${id}`,
      (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          let resultObj = {};
          if (results.length == 0) {
            reject(new Error("No Results"));
          } else if (tableName === "recipes") {
            resultObj.name = results[0].name;
          } else {
            delete results[0].id;
            resultObj.time = JSON.parse(JSON.stringify(results[0]));
          }
          resolve(resultObj);
        }
      }
    );
  });
}
