const request = require("request");
const cheerio = require("cheerio");
var RecipeSchema = require("./recipe-schema");

const allRecipes = url => {
  let Recipe = new RecipeSchema();
  // Removing search parameters from url
  url = url.split("?")[0];

  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        Recipe.name = $("#recipe-main-content").text();

        $("#polaris-app label").each((i, el) => {
          const item = $(el)
            .text()
            .replace(/\s\s+/g, "");
          if (item != "Add all ingredients to list" && item != "") {
            Recipe.ingredients.push(item);
          }
        });

        $(".step").each((i, el) => {
          const step = $(el)
            .text()
            .replace(/\s\s+/g, "");
          if (step != "") {
            Recipe.instructions.push(step);
          }
        });

        Recipe.time.prep = $("time[itemprop=prepTime]").text() || "";
        Recipe.time.cook = $("time[itemprop=cookTime]").text() || "";
        Recipe.time.ready = $("time[itemprop=totalTime]").text() || "";
        Recipe.url = url;

        resolve(Recipe);
      } else {
        reject(error);
      }
    });
  });
};

module.exports = allRecipes;
