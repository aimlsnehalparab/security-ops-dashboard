const mongoose = require("mongoose");
const LoginEvent = require("../models/LoginEvent");

const LoginEventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  success: { type: Boolean, default: true },
  ipAddress: String,
  latitude: Number,
  longitude: Number,
  country: String,
  city: String
});

module.exports = mongoose.model("LoginEvent", LoginEventSchema);
