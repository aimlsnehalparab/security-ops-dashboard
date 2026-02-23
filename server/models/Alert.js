// server/models/Alert.js
const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  /* ---------------- Universal Fields ---------------- */

  source: {
    type: String,
    required: true, // WebApp, Auth, IDS, Security Engine, Sentinel, etc.
  },

  attackType: {
    type: String,
    required: true, // login_attempt, bot_login_attempt, new_device_login
  },

  severity: {
    type: String,
    enum: ["Low", "Medium", "High","Critical"],
    default: "Low",
  },

  /**
   * Confidence indicates how sure the system is
   * that this is a real incident (SOC standard)
   */
  confidence: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },

  /**
   * Human-readable explanation
   * Example:
   * "6 failed login attempts within 45 seconds"
   */
  reason: {
    type: String,
    default: "",
  },

  /**
   * Detection signals that contributed to this alert
   * Used later for explainability in review/viva
   */
  signals: {
    type: [String],
    default: [],
  },

  /* ---------------- RISK SCORING (STEP 1 CORE) ---------------- */

  /**
   * Risk score calculated by Security Engine
   * 0–20   → Normal
   * 21–50  → Suspicious
   * 51+    → High Risk
   */
  riskScore: {
    type: Number,
    default: 0,
    index: true,
  },

  /**
   * Entity this alert is associated with
   * usernameHash | deviceHash | ip
   */
  riskEntity: {
    type: String,
    default: "",
    index: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  mitre: [
  {
    techniqueId: String,
    techniqueName: String
  }
],

  /* ---------------- Flexible Metadata ---------------- */

  /**
   * Stores raw supporting data:
   * deviceHash, ip, userAgent, endpoint, headers, etc.
   */
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  /* ---------------- Backward Compatibility ---------------- */

  // Legacy fields kept so nothing breaks
  type: { type: String, default: "" },
  value: { type: String, default: "" },
  endpoint: { type: String, default: "" },
  extra: { type: Object, default: {} },
});

/* ---------------- Indexes (Performance) ---------------- */
alertSchema.index({ riskEntity: 1, timestamp: -1 });
alertSchema.index({ attackType: 1, severity: 1 });

module.exports = mongoose.model("Alert", alertSchema);
