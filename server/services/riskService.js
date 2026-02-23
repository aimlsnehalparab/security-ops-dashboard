const MITRE = require("../constants/mitreMap");

function calculateRiskLevel(score) {
  if (score >= 75) return "Critical";
  if (score >= 40) return "High";
  if (score >= 20) return "Medium";
  return "Low";
}

function addMitreTechnique(profile, mitreData) {
  if (!Array.isArray(profile.mitre)) {
    profile.mitre = [];
  }

  const exists = profile.mitre.some(
    (m) => m.techniqueId === mitreData.techniqueId
  );

  if (!exists) {
    profile.mitre.push({
      techniqueId: mitreData.techniqueId,
      technique: mitreData.technique,
      tactic: mitreData.tactic,
      detectedAt: new Date(),
    });
  }
}

/* ===========================
   IMPOSSIBLE TRAVEL
=========================== */
function applyImpossibleTravelRisk(profile, geoResult) {
  profile.riskScore += 25;
  profile.riskLevel = calculateRiskLevel(profile.riskScore);
  profile.confidence = "High";

  if (!profile.signals.includes("Impossible travel detected")) {
    profile.signals.push("Impossible travel detected");
  }

  addMitreTechnique(profile, MITRE.IMPOSSIBLE_TRAVEL);

  profile.lastIncidentAt = new Date();
  profile.lastRiskUpdateAt = new Date();
}

/* ===========================
   BRUTE FORCE
=========================== */
function applyBruteForceRisk(profile) {
  profile.riskScore += 15;
  profile.riskLevel = calculateRiskLevel(profile.riskScore);
  profile.confidence = "Medium";

  if (!profile.signals.includes("Multiple failed login attempts")) {
    profile.signals.push("Multiple failed login attempts");
  }

  addMitreTechnique(profile, MITRE.BRUTE_FORCE);

  profile.lastRiskUpdateAt = new Date();
}

module.exports = {
  applyImpossibleTravelRisk,
  applyBruteForceRisk,
};
