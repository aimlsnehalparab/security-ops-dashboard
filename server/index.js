// server/index.js
require("dotenv").config();

console.log("JWT_SECRET =", process.env.JWT_SECRET);
console.log("JWT_REFRESH_SECRET =", process.env.JWT_REFRESH_SECRET);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const searchRoute = require("./routes/searchRoute.js");
const loginRoute = require("./routes/loginRoute.js");
const uploadRoute = require("./routes/uploadRoute.js");
const alertsRoute = require("./routes/alertsRoute.js");
const logsRouteFactory = require("./routes/logs.js");
const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");
const adminAuthRoute = require("./routes/adminAuthRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const adminAlertsRoute = require("./routes/adminAlertsRoute");
const adminAuditLogsRoute = require("./routes/adminAuditLogsRoute");
const adminPreAuthRoute = require("./routes/adminPreAuthRoute");
const adminRefreshRoute = require("./routes/adminRefreshRoute");
const adminLogoutRoute = require("./routes/adminLogoutRoute");
const healthRoute = require("./routes/healthRoute");

const app = express();
const server = http.createServer(app);

/* -------------------- Socket.IO -------------------- */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/* -------------------- Middleware -------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT FOR IP DETECTION
app.set("trust proxy", true);

/* -------------------- MongoDB -------------------- */
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/security_dashboard"
  )
  .then(() => {
    console.log("✅ MongoDB connected");

    console.log("📌 Mongo URI:", process.env.MONGO_URI || "mongodb://127.0.0.1:27017/security_dashboard");
    console.log("📌 DB Name:", mongoose.connection.name);
    console.log("📌 Host:", mongoose.connection.host);
    console.log("📌 Port:", mongoose.connection.port);
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

/* Inject socket instance */
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* -------------------- Routes -------------------- */
app.use("/search", searchRoute);
app.use("/login", loginRoute);
app.use("/upload", uploadRoute);

app.use("/api/alerts", alertsRoute);
app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminAuthRoute);
app.use("/api/admin", dashboardRoute);
app.use("/api/admin/alerts", adminAlertsRoute);
app.use("/api/admin/audit-logs", adminAuditLogsRoute);
app.use("/api/admin/pre-auth", adminPreAuthRoute);
app.use("/api/admin/refresh-token", adminRefreshRoute);
app.use("/api/admin/logout", adminLogoutRoute);
app.use("/api/admin/health", healthRoute);

// Logs route (factory pattern)
const logsRoute = logsRouteFactory(io);
app.use("/api/logs", logsRoute);

/* -------------------- Socket Events -------------------- */
io.on("connection", (socket) => {
  console.log("🟢 Socket.IO client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Socket.IO client disconnected:", socket.id);
  });
});

/* -------------------- Risk Decay Job -------------------- */
const { startRiskDecayJob } = require("./jobs/riskDecayJob");
startRiskDecayJob();

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
