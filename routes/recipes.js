const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const parseDomain = require("parse-domain");

const allRecipes = require("../scrapers/allrecipes");
const foodNetwork = require("../scrapers/foodNetwork");
const ambitiousKitchen = require("../scrapers/ambitiouskitchen");

const domains = {
  allrecipes: allRecipes,
  foodnetwork: foodNetwork,
  ambitiouskitchen: ambitiousKitchen
};

// User Model
const Recipe = require("../database/Recipe");

router.post("/add", async (req, res, next) => {
  const { recipe, user_id } = req.body;
  try {
    let results = await Recipe.create(recipe, user_id);
    res.send(results);
  } catch (error) {
    next(error);
  }
});

router.post("/create_or_update", async (req, res, next) => {
  const { recipe, recipe_id, user_id } = req.body;
  try {
    let results = await Recipe.createOrUpdate(recipe, recipe_id, user_id);
    res.send(results);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/delete_users_recipes/:recipeId/:userId",
  async (req, res, next) => {
    let recipeId = req.params.recipeId;
    let userId = req.params.userId;
    if (req.user.id != userId) {
      res.status(403).send("User ID does not match.");
    } else {
      try {
        let results = await Recipe.deleteUsersRecipes(recipeId, userId);
        res.send(results);
      } catch (error) {
        next(error);
      }
    }
  }
);

router.post("/scrape", async (req, res, next) => {
  const { url } = req.body;
  let domain = parseDomain(url).domain;
  if (domains[domain] === undefined) {
    next(new Error("Site not yet supported, please enter manually below"));
  } else {
    try {
      let recipe = await domains[domain](url);
      res.send(recipe);
    } catch (error) {
      next(error);
    }
  }
});

router.get("/find_one/:recipeId", async (req, res, next) => {
  let id = req.params.recipeId;
  try {
    let recipe = await Recipe.findOneById(id);
    res.send(recipe);
  } catch (error) {
    if (error.message === "No Results") {
      res.status("204").send(error);
    } else {
      next(error);
    }
  }
});

router.get("/find_by_user_id/:userId", async (req, res, next) => {
  let id = req.params.userId;
  try {
    let recipes = await Recipe.findByUserId(id);
    res.send(recipes);
  } catch (error) {
    if (error.message === "No Results") {
      res.status("204").send(error);
    } else {
      next(error);
    }
  }
});

router.get("/find_favorites/:userId", async (req, res, next) => {
  let id = req.params.userId;
  try {
    let recipes = await Recipe.findFavorites(id);
    res.send(recipes);
  } catch (error) {
    if (error.message === "No Results") {
      res.status("204").send(error);
    } else {
      next(error);
    }
  }
});

router.post("/set_favorite", async (req, res, next) => {
  const { user_id, recipe_id, value } = req.body;
  try {
    let results = await Recipe.setFavorite(user_id, recipe_id, value);
    res.send(results);
  } catch (error) {
    next(error);
  }
});

router.get("/is_favorite/:userId/:recipeId", async (req, res, next) => {
  let userId = req.params.userId;
  let recipeId = req.params.recipeId;
  try {
    let results = await Recipe.isFavorite(userId, recipeId);
    if (results[0].favorite) {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
