const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const RefreshToken = require("../models/RefreshToken");
const auditLogger = require("../middleware/auditLogger");

const router = express.Router();

/**
 * POST /api/admin/logout
 */
router.post(
  "/",
  adminAuth,
  auditLogger("ADMIN_LOGOUT"),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token required" });
      }

      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        { revoked: true }
      );

      res.json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
