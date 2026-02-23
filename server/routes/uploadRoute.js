const express = require("express");
const multer = require("multer");
const path = require("path");
const detectAttack = require("../utils/detect.js");

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Define route
router.post("/", upload.single("file"), detectAttack, (req, res) => {
  res.json({ message: "File uploaded successfully", file: req.file });
});

module.exports = router;
