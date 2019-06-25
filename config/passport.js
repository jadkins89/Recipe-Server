const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Load User
const User = require('../database/User');

passport.use(new LocalStrategy({ 
    usernameField: 'email', 
    passwordField: 'password' 
  }, 
  (email, password, done) => {
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

// passport.serializeUser((user, done) => {
//   console.log(user);
//   done(null, user.id);
// });
// 
// passport.deserializeUser((id, done) => {
//   console.log(id);
//   User.findById(id)
//   .then(user => {
//     done(null, user);
//   })
//   .catch(error => {
//     done(error, null);
//   });
// });

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  },
  function (jwtPayload, cb) {
    return User.findById(jwtPayload.id)
      .then(user => {
        return cb(null, user);
      })
      .catch(err => {
        return cb(err);
      });
  }
));