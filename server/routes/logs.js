// server/routes/logs.js
const express = require("express");
const Log = require("../models/log");

module.exports = function (io) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const logs = await Log.find()
        .sort({ timestamp: -1 })
        .limit(100);

      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const log = new Log({
        ...req.body,
        timestamp: req.body.timestamp
          ? new Date(req.body.timestamp)
          : new Date(),
      });

      await log.save();
      io.emit("new-log", log);

      res.status(201).json(log);
    } catch {
      res.status(400).json({ error: "Invalid log data" });
    }
  });

  return router;
};
