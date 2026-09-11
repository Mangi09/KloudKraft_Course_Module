const express = require("express");
const cors = require("cors");
const coursesRouter = require("./routes/courses.routes");
const sectionsRouter = require("./routes/sections.routes");
const lessonsRouter = require("./routes/lessons.routes");
const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use("/api/courses", coursesRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/lessons", lessonsRouter);
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
