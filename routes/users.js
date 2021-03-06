const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// User Model
const User = require("../database/User");

// Register Handle
router.post("/register", async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  let errors = [];

  // Check required fields
  if (!firstName || !lastName || !email || !password) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters long" });
  }

  if (errors.length > 0) {
    next(new Error(errors));
  } else {
    // Validation passed
    let user = await User.findOne(email);
    if (user) {
      // User exists
      errors.push({ msg: "Email is already registered" });
      next(new Error(errors));
    } else {
      const newUser = {
        firstName,
        lastName,
        email,
        password
      };
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          try {
            await User.create(newUser);
            delete newUser.password;
            res.send(newUser);
          } catch (err) {
            console.log(err);
          }
        })
      );
    }
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (user) {
      delete user.password;
      var loggedUser = {
        ...user
      };
      req.login(loggedUser, { session: false }, error => {
        if (error) {
          res.send(error);
        }

        const token = jwt.sign(loggedUser, "your_jwt_secret");
        return res.json({ loggedUser, token });
      });
    } else {
      const error = new Error(info.message);
      error.status = 401;
      return next(error);
    }
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.send("✌️");
});

module.exports = router;
