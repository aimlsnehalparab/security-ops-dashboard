const geoip = require("geoip-lite");

module.exports = (req, res, next) => {
  const admin = req.admin;

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  // IPv6 localhost fix
  const cleanIp = ip === "::1" ? "127.0.0.1" : ip;

  // 1️⃣ IP allowlist check
  if (admin.allowedIPs?.length) {
    if (!admin.allowedIPs.includes(cleanIp)) {
      return res.status(403).json({
        message: "Access denied: IP not allowed"
      });
    }
  }

  // 2️⃣ Geo-fencing check
  if (admin.allowedCountries?.length) {
    const geo = geoip.lookup(cleanIp);
    if (!geo || !admin.allowedCountries.includes(geo.country)) {
      return res.status(403).json({
        message: "Access denied: Location not allowed"
      });
    }
  }

  next();
};
