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
  var { recipe } = req.body;
  Recipe.create(recipe)
    .then(results => {
      res.send(results);
    })
    .catch(error => {
      res.send(error);
    });
});

router.post("/find", (req, res, next) => {
  var { url } = req.body;
  let domain = parseDomain(url).domain;
  domains[domain](url)
    .then(recipe => {
      res.send(recipe);
    })
    .catch(error => {
      res.send(error);
    });
});

// router.post("/add", (req, res, next) => {
//   var { url } = req.body;
//   let domain = parseDomain(url).domain;
//   domains[domain](url)
//     .then(recipe => {
//       Recipe.create(recipe)
//         .then(results => {
//           res.send(results);
//         })
//         .catch(error => {
//           res.send(error);
//         });
//     })
//     .catch(error => {
//       res.send(error);
//     });
// });

module.exports = router;