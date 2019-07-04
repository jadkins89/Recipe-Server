const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const parseDomain = require("parse-domain");

const allRecipes = require("../scrapers/allrecipes");
const foodNetwork = require("../scrapers/foodNetwork");

const domains = {
  allrecipes: allRecipes,
  foodnetwork: foodNetwork
};

// User Model
const Recipe = require("../database/Recipe");

router.post("/add", (req, res, next) => {
  var { recipe, user_id } = req.body;
  Recipe.create(recipe, user_id)
    .then(results => {
      res.send(results);
    })
    .catch(error => {
      res.send(error);
    });
});

router.post("/scrape", (req, res, next) => {
  var { url } = req.body;
  let domain = parseDomain(url).domain;
  if (domains[domain] === undefined) {
    next(new Error("Site not yet supported, please enter manually below"));
  } else {
    domains[domain](url)
      .then(recipe => {
        res.send(recipe);
      })
      .catch(error => {
        res.send(error);
      });
  }
});

router.get("/find/:recipeId", (req, res, next) => {
  let id = req.params.recipeId;
  Recipe.findById(id)
    .then(recipe => {
      res.send(recipe);
    })
    .catch(error => {
      if (error.message === "No Results") {
        res.status("404").send(error);
      } else {
        next(error);
      }
    });
});

module.exports = router;
