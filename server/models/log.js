const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  /* ---------------- Core dashboard fields ---------------- */
  message: {
    type: String,
    required: true,
  },
  email: String,
  level: {
    type: String,
    enum: ["Low", "Medium", "High", "Info"],
    default: "Info",
  },
  source: {
    type: String,
    default: "System",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },

  /* ---------------- Network / security metadata ---------------- */
  sourceIP: String,
  destinationIP: String,
  protocol: String,
  action: String,
  status: String,

  /* ---------------- Detection engine output ---------------- */
  detection: {
    detected: { type: Boolean, default: false },
    attackType: String,
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
  },
});

module.exports = mongoose.model("Log", logSchema);
