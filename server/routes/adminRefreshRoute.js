const express = require("express");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const Admin = require("../models/Admin");

const router = express.Router();

router.post("/", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
    revoked: false
  });

  if (!storedToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const admin = await Admin.findById(payload.adminId);

    const newAccessToken = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
        mfaVerified: true
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Expired refresh token" });
  }
});

module.exports = router;
