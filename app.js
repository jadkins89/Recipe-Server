const express = require("express");
const cors = require("cors");
const passport = require("passport");

const app = express();
var keys = require("./config/keys");
const connection = require("./database/connection");

// Passport Config
require("./config/passport");

// Cors
app.use(cors());

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/users", require("./routes/users"));
app.use("/recipes", require("./routes/recipes"));
app.use(
  "/auth",
  passport.authenticate("jwt", { session: false }),
  require("./routes/auth")
);

// Error Handling
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err.message);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
