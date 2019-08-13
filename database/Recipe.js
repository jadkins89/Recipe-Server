const connection = require("./connection");

const create = async (recipe, user_id, original_id) => {
  const { name, time, ingredients, instructions, url, modified } = recipe;
  return new Promise(async (resolve, reject) => {
    try {
      let res = await addRecipe(name, url, modified, original_id);
      let results = await Promise.all([
        addTime(res.insertId, time),
        addArrayItems(res.insertId, "ingredients", ingredients),
        addArrayItems(res.insertId, "instructions", instructions),
        addUsersRecipes(user_id, res.insertId)
      ]);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

const createOrUpdate = (recipe, recipe_id, user_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let usersRecipes = await getUsersRecipes(recipe_id);
      const { url, modified } = recipe;
      // If usersRecipes is unique and recipe isn't from a URL or has been modified, simply update the current recipe
      if (usersRecipes.length === 1 && (!url || modified)) {
        const { name, time, ingredients, instructions } = recipe;
        let results = await Promise.all([
          updateRecipe(recipe_id, name, url, true),
          updateTime(recipe_id, time),
          updateArrayItems(recipe_id, "ingredients", ingredients),
          updateArrayItems(recipe_id, "instructions", instructions)
        ]);
        resolve(results);
        // Create new recipe otherwise, maintaining the original
      } else {
        recipe.modified = true;
        let response = await create(recipe, user_id, recipe_id);
        resolve(response);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteUsersRecipes = (recipeId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let usersRecipes = await getUsersRecipes(recipeId);
      // Delete entry
      if (usersRecipes.length > 1) {
        connection.query(
          `DELETE FROM users_recipes WHERE Users_id=${userId} AND Recipes_id=${recipeId}`,
          (error, results, fields) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
        // If only entry, delete all recipe data
      } else if (usersRecipes.length === 1) {
        let results = await deleteRecipe(recipeId);
        resolve(results);
      } else {
        throw new Error(`No users_recipes row for recipe_id: ${recipeId}`);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const findOneById = async id => {
  let recipe = {};
  return new Promise(async (resolve, reject) => {
    try {
      let results = await Promise.all([
        getOneById(id, "recipes"),
        getOneById(id, "time"),
        getArrayItem(id, "ingredients"),
        getArrayItem(id, "instructions")
      ]);
      results.map(item => {
        Object.assign(recipe, item);
      });
      resolve(recipe);
    } catch (error) {
      reject(error);
    }
  });
};

const findByUserId = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT id, name, favorite FROM users_recipes 
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
};

const findFavorites = id => {
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
};

const setFavorite = (user_id, recipe_id, value) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE users_recipes SET favorite=${value} WHERE Users_id=${user_id} AND Recipes_id=${recipe_id}`,
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

const isFavorite = (userId, recipeId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT favorite FROM users_recipes WHERE Users_id=${userId} AND Recipes_id=${recipeId}`,
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

const getUsersRecipes = recipeId => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM users_recipes WHERE Recipes_id=${recipeId}`,
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

// Utility Functions
const addRecipe = (name, url, modified, originalId) => {
  name = name.replace("'", "''");
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO recipes (name, url, modified, original_id) VALUES ('${name}', ${url}, ${modified}, ${originalId})`,
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

const updateRecipe = (id, name, url, modified, original_id = null) => {
  name = name.replace(/'/g, "''");
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE recipes 
      SET
        name='${name}',
        url=${url},
        modified=${modified},
        original_id=${original_id}
      WHERE
        id=${id}`,
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

const addTime = (id, time) => {
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
};

const updateTime = (id, time) => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await Promise.all([deleteTime(id), addTime(id, time)]);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

const deleteTime = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      `DELETE FROM time WHERE id=${id}`,
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

const addArrayItems = (id, tableName, array) => {
  let colName = tableName.slice(0, -1);
  let query = `INSERT INTO ${tableName} (order_id, ${colName}, recipe_id) VALUES `;
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
};

const updateArrayItems = (id, tableName, array) => {
  return new Promise(async (resolve, reject) => {
    try {
      let results = await Promise.all([
        deleteArrayItems(id, tableName),
        addArrayItems(id, tableName, array)
      ]);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

const deleteArrayItems = (id, tableName) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `DELETE FROM ${tableName} WHERE recipe_id=${id}`,
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

const addUsersRecipes = (user_id, recipe_id, favorite) => {
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
};

const getArrayItem = (recipe_id, tableName) => {
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
};

const getOneById = (id, tableName) => {
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
            resultObj.url = results[0].url;
            resultObj.modified = results[0].modified;
          } else {
            delete results[0].id;
            resultObj.time = JSON.parse(JSON.stringify(results[0]));
          }
          resolve(resultObj);
        }
      }
    );
  });
};

const deleteRecipe = recipeId => {
  return new Promise((resolve, reject) => {
    connection.query(
      `DELETE FROM recipes WHERE id=${recipeId}`,
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

module.exports = {
  create,
  createOrUpdate,
  deleteUsersRecipes,
  findOneById,
  findByUserId,
  findFavorites,
  setFavorite,
  isFavorite
};
