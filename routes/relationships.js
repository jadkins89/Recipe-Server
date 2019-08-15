const express = require("express");
const router = express.Router();

const Relationships = require("../database/Relationships");

router.post("/request", async (req, res, next) => {
  const { reqUserId, resUserId } = req.body;
  try {
    let results = await Relationships.request(reqUserId, resUserId);
    res.send(results);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
