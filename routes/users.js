const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require('../database/User');

// Register Handle
router.post('/register', (req, res, next) => {
  console.log(req.body);
  const {firstName, lastName, email, password } = req.body;
  let errors = [];
  
  // Check required fields
  if (!firstName || !lastName || !email || !password) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  
  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters long' });
  }
  
  if (errors.length > 0) {
    next(new Error(errors));
  } else {
    // Validation passed
    User.findOne(email)
    .then((user) => {
      if (user) {
        // User exists
        errors.push({ msg: 'Email is already registered' });
        next(new Error(errors));
      } else {
        const newUser = {
          firstName,
          lastName,
          email,
          password
        };
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            User.create(newUser)
            .then(user => {
              // req.flash('success_msg', 'You are now registered and can log in');
              res.send("✅");
            })
            .catch(err => console.log(err));
          }));
      }
    });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    failureFlash: true
  }, function(error, user, info) {
    if (user) {
      res.send(user);
    } else {
      const error = new Error(info.message);
      error.status = 401;
      return next(error);
    }
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.send("✌️");
})

module.exports = router;