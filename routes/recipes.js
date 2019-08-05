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

router.get("/find_one/:recipeId", (req, res, next) => {
  let id = req.params.recipeId;
  Recipe.findOneById(id)
    .then(recipe => {
      res.send(recipe);
    })
    .catch(error => {
      if (error.message === "No Results") {
        res.status("204").send(error);
      } else {
        next(error);
      }
    });
});

router.get("/find_by_user_id/:userId", (req, res, next) => {
  let id = req.params.userId;
  Recipe.findByUserId(id)
    .then(recipes => {
      res.send(recipes);
    })
    .catch(error => {
      if (error.message === "No Results") {
        res.status("204").send(error);
      } else {
        next(error);
      }
    });
});

module.exports = router;
