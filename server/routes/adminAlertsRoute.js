const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const auditLogger = require("../middleware/auditLogger");

const router = express.Router();

/**
 * GET /api/admin/alerts
 * Case 3: Authenticated admin + audited action
 */
router.get(
  "/",
  adminAuth,
  auditLogger("VIEW_ALERTS"),
  async (req, res) => {
    res.json({
      success: true,
      message: "Admin Alerts fetched successfully",
      alerts: [
        {
          id: 1,
          type: "LOGIN_ATTEMPT",
          severity: "HIGH",
          description: "Multiple failed login attempts detected"
        },
        {
          id: 2,
          type: "IP_BLOCK",
          severity: "MEDIUM",
          description: "IP temporarily blocked due to suspicious activity"
        }
      ]
    });
  }
);

module.exports = router;
