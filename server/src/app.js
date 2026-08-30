const express = require("express");
const cors = require("cors");

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Placeholder health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// --- Routers will be mounted here in later days ---
// e.g. app.use("/api/auth", authRouter);

// Centralized error-handling middleware (must be registered last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
});

module.exports = app;