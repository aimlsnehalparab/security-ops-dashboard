const AuditLog = require("../models/AuditLog");

const auditLogger = (action) => {
  return async (req, res, next) => {
    try {
      if (req.admin) {
        await AuditLog.create({
          adminId: req.admin.adminId || req.admin._id,
          action,
          endpoint: req.originalUrl,
          ip: req.ip,
          userAgent: req.headers["user-agent"]
        });
      }
    } catch (err) {
      console.error("Audit log error:", err.message);
    }
    next();
  };
};

module.exports = auditLogger;
