const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User
const User = require('../database/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne(email)
      .then( user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password is incorrect' });
          }
        });
      })
      .catch( error => console.log(error));
    })
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(error => {
      done(error, null);
    });
  })
}