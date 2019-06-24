const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const app = express();
var keys = require('./config/keys');

// Passport Config
require('./config/passport')(passport);

// Cors
app.use(cors());

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Express Session
app.use(session({
  secret: keys.sessionSecret,
  resave: true,
  saveUninitialized: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/users', require('./routes/users'));

// Error Handling
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err.message);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err: {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));