const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const adminIpGuard = require("../middleware/adminIpGuard");
const auditLogger = require("../middleware/auditLogger");

const router = express.Router();

/**
 * POST /api/admin/pre-auth
 * Pre-dashboard security gate
 */
router.post(
  "/",
  adminAuth,
  adminIpGuard, 
  auditLogger("PRE_DASHBOARD_CHECK"),
  async (req, res) => {
    const { mfaVerified } = req.tokenPayload;

    // 1️⃣ MFA check
    if (!mfaVerified) {
      return res.status(403).json({
        success: false,
        step: "MFA_REQUIRED",
        message: "Multi-factor authentication required"
      });
    }

    // 2️⃣ IP / Geo check (placeholder)
    const clientIp = req.ip;

    // later we can add allowlist / geo logic here

    return res.json({
      success: true,
      message: "Pre-dashboard authentication passed",
      allowDashboard: true
    });
  }
);

module.exports = router;
