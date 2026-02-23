// server/jobs/riskDecayJob.js
const RiskProfile = require("../models/RiskProfile");
const Alert = require("../models/Alert");

const DECAY_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes

async function runRiskDecay() {
  const now = new Date();

  const profiles = await RiskProfile.find({
    riskScore: { $gt: 0 },
  });

  for (const profile of profiles) {
    const minutesSinceUpdate =
      (now - profile.lastRiskUpdateAt) / 60000;

    if (minutesSinceUpdate < 5) continue;

    const decayAmount = profile.decayRate;
    const newScore = Math.max(0, profile.riskScore - decayAmount);

    let newLevel = "Low";
    if (newScore >= 40) newLevel = "High";
    else if (newScore >= 25) newLevel = "Medium";

    profile.riskScore = newScore;
    profile.riskLevel = newLevel;
    profile.lastRiskUpdateAt = now;

    // Auto-unlock if safe
    if (newScore < 25 && profile.status === "locked") {
      profile.status = "active";
      profile.lockUntil = null;

      await Alert.create({
        source: "Security Engine",
        attackType: "account_unlocked",
        severity: "Low",
        confidence: "High",
        reason: "Risk decayed to safe level",
        meta: {
          entityType: profile.entityType,
          entityId: profile.entityId,
        },
        timestamp: new Date(),
      });
    }

    await profile.save();
  }
}

function startRiskDecayJob() {
  setInterval(runRiskDecay, DECAY_INTERVAL_MS);
  console.log("🕒 Risk Decay Engine started");
}

module.exports = { startRiskDecayJob };
