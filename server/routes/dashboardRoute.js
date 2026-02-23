const express = require("express");
const requireAdminMFA = require("../middleware/requireAdminMFA");

const router = express.Router();

router.get("/dashboard", requireAdminMFA, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Admin Dashboard",
    admin: req.admin
  });
});

module.exports = router;
