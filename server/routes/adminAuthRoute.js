const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const Admin = require("../models/Admin");
const RefreshToken = require("../models/RefreshToken");
const adminMfaAuth = require("../middleware/adminMfaAuth");
const auditLogger = require("../middleware/auditLogger");

const router = express.Router();

/* ===============================
   🔧 TOKEN HELPERS
   =============================== */

const createAccessToken = (admin, mfaVerified = false) => {
  return jwt.sign(
    {
      adminId: admin._id,
      role: "admin",
      mfaVerified
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const createRefreshToken = async (admin) => {
  const token = jwt.sign(
    { adminId: admin._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({
    adminId: admin._id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return token;
};

/* ===============================
   🔐 LOGIN (PASSWORD)
   =============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 MFA ENABLED → TEMP TOKEN
    if (admin.mfaEnabled) {
      const tempToken = jwt.sign(
        {
          adminId: admin._id,
          stage: "MFA_PENDING"
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        success: true,
        mfaRequired: true,
        tempToken
      });
    }

    // ✅ NO MFA
    const accessToken = createAccessToken(admin, true);
    const refreshToken = await createRefreshToken(admin);

    return res.json({
      success: true,
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* ===============================
   📲 MFA SETUP
   =============================== */
router.post("/mfa/setup", require("../middleware/adminAuth"), async (req, res) => {
  try {
    const admin = req.admin;

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `SecurityOps (${admin.email})`
    });

    admin.mfaSecret = secret.base32;
    admin.mfaEnabled = false;
    await admin.save();

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      qrCode,
      manualCode: secret.base32
    });
  } catch (err) {
    console.error("🔥 MFA SETUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   🔢 MFA VERIFY
   =============================== */
router.post(
  "/mfa/verify",
  require("../middleware/adminAuth"),
  auditLogger("MFA_VERIFIED"),
  async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "MFA token is required" });
      }

      const admin = req.admin;
      if (!admin.mfaSecret) {
        return res.status(400).json({ message: "MFA not setup" });
      }

      const verified = speakeasy.totp.verify({
        secret: admin.mfaSecret,
        encoding: "base32",
        token: token.toString(),
        window: 1
      });

      if (!verified) {
        return res.status(401).json({ message: "Invalid MFA code" });
      }

      admin.mfaEnabled = true;
      await admin.save();

      const accessToken = createAccessToken(admin, true);
      const refreshToken = await createRefreshToken(admin);

      return res.json({
        success: true,
        message: "MFA verified successfully",
        accessToken,
        refreshToken
      });

    } catch (err) {
      console.error("🔥 MFA VERIFY ERROR:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message
      });
    }
  }
);

module.exports = router;
