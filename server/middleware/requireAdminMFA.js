const jwt = require("jsonwebtoken");

module.exports = function requireAdminMFA(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 CORRECT MFA FIELD
    if (!decoded.mfaVerified) {
      return res.status(403).json({
        message: "MFA verification required"
      });
    }

    req.admin = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
