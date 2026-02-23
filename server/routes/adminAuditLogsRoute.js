const express = require("express");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/**
 * GET /api/admin/audit-logs
 * Case 3: View audit logs (SOC / Admin)
 */
router.get("/", adminAuth, async (req, res) => {
  res.json({
    success: true,
    message: "Audit logs fetched successfully",
    logs: [
      {
        action: "VIEW_ALERTS",
        performedBy: req.tokenPayload.adminId,
        role: req.tokenPayload.role,
        timestamp: new Date()
      },
      {
        action: "VIEW_RISK_PROFILES",
        performedBy: req.tokenPayload.adminId,
        role: req.tokenPayload.role,
        timestamp: new Date()
      }
    ]
  });
});

module.exports = router;
