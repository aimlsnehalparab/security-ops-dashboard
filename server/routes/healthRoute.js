const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const Log = require("../models/log");
const RiskProfile = require("../models/RiskProfile");

router.get("/", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const now = new Date();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    /* ================= TOTAL ALERTS TODAY ================= */
    const totalAlertsToday = await Alert.countDocuments({
      timestamp: { $gte: startOfDay },
    });

    /* ================= HIGH SEVERITY ================= */
    const highSeverityCount = await Alert.countDocuments({
      timestamp: { $gte: startOfDay },
      severity: "High",
    });

    /* ================= LOCKED ACCOUNTS ================= */
    const lockedAccounts = await RiskProfile.countDocuments({
      status: "locked",
      lockUntil: { $gte: now },
    });

    /* ================= BOT DETECTIONS ================= */
    const botDetections = await Alert.countDocuments({
      attackType: "automated_login_attempt",
      timestamp: { $gte: startOfDay },
    });

    /* ================= FAILED LOGINS (24H) ================= */
    const failedLoginsToday = await Log.countDocuments({
      message: "Login failed",
      timestamp: { $gte: last24h },
    });

    /* ================= AVG RISK SCORE ================= */
    const avgRiskResult = await RiskProfile.aggregate([
      { $group: { _id: null, avgRisk: { $avg: "$riskScore" } } },
    ]);

    const avgRiskScore = avgRiskResult[0]?.avgRisk || 0;

    /* ================= PEAK ATTACK HOUR ================= */
    const hourlyTrend = await Log.aggregate([
      {
        $match: {
          message: "Login failed",
          timestamp: { $gte: startOfDay },
        },
      },
      {
        $group: {
           _id: {
    $hour: {
      date: "$timestamp",
      timezone: "Asia/Kolkata"
    }
  },
  count: { $sum: 1 }
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    let peakHour = null;
    let peakCount = 0;

    hourlyTrend.forEach((h) => {
      if (h.count > peakCount) {
        peakCount = h.count;
        peakHour = h._id;
      }
    });

    /* ================= MOST TARGETED USER ================= */
    const targetedUser = await Log.aggregate([
      {
        $match: {
          message: "Login failed",
          timestamp: { $gte: startOfDay },
          email: { $ne: "" },
        },
      },
      {
        $group: {
          _id: "$email",
          attempts: { $sum: 1 },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 1 },
    ]);

    const mostTargetedUser = targetedUser[0] || null;

    res.json({
      totalAlertsToday,
      highSeverityCount,
      lockedAccounts,
      botDetections,
      failedLoginsToday,
      avgRiskScore: Math.round(avgRiskScore),
      peakHour,
      peakCount,
      mostTargetedUser,
      hourlyTrend,
    });
  } catch (err) {
    console.error("Health panel error:", err);
    res.status(500).json({ error: "health_fetch_failed" });
  }
});

module.exports = router;