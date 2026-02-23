const express = require("express");
const router = express.Router();
const RiskProfile = require("../models/RiskProfile");
const LoginEvent = require("../models/LoginEvent");
const adminAuth = require("../middleware/adminAuth");

/* ✅ ADD THIS LINE */
const { checkImpossibleTravel } = require("../services/geoVelocityService");

/* ==============================
   GET ALL RISK PROFILES
============================== */
router.get("/risk-profiles", adminAuth, async (req, res) => {
  try {
    const profiles = await RiskProfile.find()
      .sort({ lastRiskUpdateAt: -1 });

    res.json({ success: true, profiles });
  } catch (err) {
    console.error("Risk profiles error:", err);
    res.status(500).json({ success: false });
  }
});

/* ==============================
   GET USER LOGIN GEO HISTORY
============================== */
router.get("/user-logins/:entityId", async (req, res) => {
  try {
    const { entityId } = req.params;

    const events = await LoginEvent.find({ userId: entityId })
      .sort({ timestamp: 1 });

    const impossibleTravel = await checkImpossibleTravel(entityId);

    return res.json({
      success: true,
      events,
      impossibleTravel,
    });

  } catch (err) {
    console.error("Admin user-logins error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ==============================
   LOCK USER
============================== */
router.post("/lock/:entityId", adminAuth, async (req, res) => {
  await RiskProfile.findOneAndUpdate(
    { entityId: req.params.entityId },
    {
      status: "locked",
      lockUntil: new Date(Date.now() + 30 * 60 * 1000),
      lastIncidentAt: new Date(),
      lastRiskUpdateAt: new Date(),
    }
  );

  res.json({ success: true, message: "User locked" });
});

/* ==============================
   UNLOCK USER
============================== */
router.post("/unlock/:entityId", adminAuth, async (req, res) => {
  await RiskProfile.findOneAndUpdate(
    { entityId: req.params.entityId },
    {
      status: "active",
      lockUntil: null,
      lastRiskUpdateAt: new Date(),
    }
  );

  res.json({ success: true, message: "User unlocked" });
});

/* ==============================
   TRUST USER
============================== */
router.post("/trust/:entityId", adminAuth, async (req, res) => {
  await RiskProfile.findOneAndUpdate(
    { entityId: req.params.entityId },
    {
      riskScore: 0,
      riskLevel: "Low",
      confidence: "Low",
      signals: [],
      status: "active",
      lastRiskUpdateAt: new Date(),
    }
  );

  res.json({ success: true, message: "User marked as trusted" });
});

/* ==============================
   BLACKLIST USER
============================== */
router.post("/blacklist/:entityId", adminAuth, async (req, res) => {
  try {
    const profile = await RiskProfile.findOne({
      entityId: req.params.entityId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    profile.status = "blacklisted";
    profile.lastIncidentAt = new Date();
    profile.lastRiskUpdateAt = new Date();

    await profile.save();

    res.json({ success: true, message: "User blacklisted" });
  } catch (err) {
    console.error("Blacklist error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;