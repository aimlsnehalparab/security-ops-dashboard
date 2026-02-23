const LoginEvent = require("../models/LoginEvent");
const { checkImpossibleTravel } = require("../services/geoVelocityService");
const {
  applyImpossibleTravelRisk,
  applyBruteForceRisk
} = require("../services/riskService");
const RiskProfile = require("../models/RiskProfile");
const { getGeoFromIP } = require("../services/geoIpService");

/* ================= LOGIN HANDLER ================= */

async function handleLogin(req, res) {
  try {
    if (!req.body || !req.body.userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const { userId, success = true } = req.body;

    /* ---------- Fetch or Create Risk Profile ---------- */
    let entity = await RiskProfile.findOne({
      entityType: "user",
      entityId: userId,
    });

    if (!entity) {
      entity = await RiskProfile.create({
        entityType: "user",
        entityId: userId,
      });
    }

    entity.lastSeen = new Date();

    /* ================= BRUTE FORCE ================= */
    if (!success) {
      entity.failedLogins += 1;

      if (entity.failedLogins >= 5) {
        applyBruteForceRisk(entity);
      }
    } else {
      entity.successfulLogins += 1;
    }

    /* ================= GEO DETECTION ================= */

    /* ================= GEO DETECTION ================= */

let ip = req.headers["x-forwarded-for"];

if (!ip) {
  ip = req.socket.remoteAddress || req.ip;
}

if (ip === "::1" || ip === "127.0.0.1") {
  console.log("🌍 Localhost detected — using fallback demo IP");
  ip = "8.8.8.8";
}

console.log("🌍 Login from IP:", ip);

const geo = await getGeoFromIP(ip);

console.log("Saving login event:", geo);

/* ✅ ALWAYS STORE LOGIN EVENT (even if geo fails) */
const loginEvent = await LoginEvent.create({
  userId,
  ipAddress: geo?.ip || ip,
  latitude: geo?.latitude || null,
  longitude: geo?.longitude || null,
  country: geo?.country || "Unknown",
  city: geo?.city || "Unknown",
  success: success,
  timestamp: new Date(),
});

/* ✅ Only run impossible travel if valid coordinates */
if (geo && geo.latitude != null && geo.longitude != null) {
  const geoResult = await checkImpossibleTravel(userId);

  if (geoResult.detected) {
  console.log("🚨 Impossible Travel Detected!");

  applyImpossibleTravelRisk(entity, geoResult);

  // ✅ Store metadata in RiskProfile
  entity.meta = {
    ...entity.meta,
    impossibleTravelDetails: {
      fromCountry: geoResult.fromCountry,
      toCountry: geoResult.toCountry,
      distanceKm: geoResult.distanceKm,
      speedKmph: geoResult.speedKmph,
      timeDiffMinutes: geoResult.timeDiffMinutes,
      detectedAt: new Date()
    }
  };
}
}


    await entity.save();

    return res.json({ success: true });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { handleLogin };
