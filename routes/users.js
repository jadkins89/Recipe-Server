const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require('../database/User');

// Register Handle
router.post('/register', (req, res, next) => {
  const {first_name, last_name, email, password, password2 } = req.body;
  let errors = [];
  
  // Check required fields
  if (!first_name || !last_name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  
  // CHeck passwords match
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  
  // Write check for password specifics
  
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
          first_name,
          last_name,
          email,
          password
        };
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            User.create(newUser)
            .then(user => {
              req.flash('success_msg', 'You are now registered and can log in');
              res.send('✅');
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
      res.send('🔓');
    } else {
      res.send(info.message);
    }
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.send('✌️');
})

module.exports = router;