const express = require("express");
const router = express.Router();
const detectAttack = require("../utils/detect.js");

router.post("/", detectAttack, (req, res) => {
  res.json({ message: "Search request received" });
});

module.exports = router;
