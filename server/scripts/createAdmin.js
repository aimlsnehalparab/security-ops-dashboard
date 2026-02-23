const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env")
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const existing = await Admin.findOne({
      email: "admin@company.com"
    });

    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await Admin.create({
      email: "admin@company.com",
      password: hashedPassword
    });

    console.log("Admin created successfully");
    process.exit(0);

  } catch (err) {
    console.error("Create admin error:", err.message);
    process.exit(1);
  }
}

createAdmin();
