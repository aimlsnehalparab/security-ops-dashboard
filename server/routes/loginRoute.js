const express = require("express");
const router = express.Router();
const detectAttack = require("../utils/detect.js");

router.post("/", detectAttack, (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

module.exports = router;
