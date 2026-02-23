const express = require("express");
const router = express.Router();
const { handleLogin } = require("../controllers/authController");

// USER LOGIN (for Step 5 testing & future auth)
router.post("/login", handleLogin);

module.exports = router;
