// server/utils/detect.js
const Alert = require("../models/Alert.js");
const detectEngine = require("./detectionEngine.js");

async function detectAttack(req, res, next) {
  const logData = req.body || {};

  // Ensure failed login attempts are treated correctly
  if (logData.eventType === "login_attempt" && logData.success === false) {
    logData.message = `Failed login for user: ${logData.username || "unknown"}`;
  }

  const detection = detectEngine(logData);

  // Save alert to DB if detected
  if (detection.detected) {
    const alertDoc = new Alert({
      type: detection.attackType,
      value: logData.message || logData.eventType || logData.username || "",
      endpoint: req.originalUrl || "",
      timestamp: new Date(),
      severity: detection.severity,
      extra: { reason: detection.reason || null }
    });

    try {
      await alertDoc.save();
      detection.alertId = alertDoc._id;
        if (req.io) {
        req.io.emit("new-alert", {
          detected: true,
          alertId: alertDoc._id,
          attackType: alertDoc.type,
          severity: alertDoc.severity,
          reason: detection.reason,
        });
        console.log("📡 Alert emitted via Socket.IO:", detection);
      }
    } catch (err) {
      console.error("Alert save failed:", err.message);
    }
  }

  req.detection = detection;
  next();
}

module.exports = detectAttack;
