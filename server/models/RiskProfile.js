// server/models/RiskProfile.js
const mongoose = require("mongoose");

const riskProfileSchema = new mongoose.Schema(
  {
    /* -------- Entity Identity -------- */
    entityType: {
      type: String,
      enum: ["user", "device", "ip"],
      required: true,
    },

    entityId: {
      type: String,
      required: true,
      index: true,
    },

    /* -------- Risk Scoring -------- */

    riskScore: {
      type: Number,
      default: 0,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    confidence: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    lastImpossibleTravel: {
  fromCountry: String,
  toCountry: String,
  distanceKm: Number,
  speedKmh: Number,
  timeDiffMinutes: Number,
  detectedAt: Date,
},
    /* -------- Status -------- */

    status: {
      type: String,
      enum: ["active", "locked", "blacklisted", "trusted"],
      default: "active",
    },

    lockUntil: {
      type: Date,
    },

    /* -------- Counters -------- */

    failedLogins: {
      type: Number,
      default: 0,
    },

    successfulLogins: {
      type: Number,
      default: 0,
    },

    botIndicators: {
      type: Number,
      default: 0,
    },

    /* -------- Detection Signals -------- */

    signals: {
      type: [String],
      default: [],
    },

    /* -------- Timeline -------- */

    firstSeen: {
      type: Date,
      default: Date.now,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    lastIncidentAt: {
      type: Date,
    },

    lastRiskUpdateAt: {
      type: Date,
      default: Date.now,
    },

    decayRate: {
      type: Number,
      default: 5,
    },

    /* -------- MITRE Mapping -------- */

    mitre: [
      {
        techniqueId: String,
        technique: String,
        tactic: String,
        detectedAt: Date,
      },
    ],

    /* -------- Metadata -------- */

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // 🔥 This adds createdAt & updatedAt automatically
  }
);

/* -------- Indexes -------- */
riskProfileSchema.index({ entityType: 1, entityId: 1 }, { unique: true });
riskProfileSchema.index({ riskLevel: 1 });
riskProfileSchema.index({ status: 1 });

module.exports = mongoose.model("RiskProfile", riskProfileSchema);
