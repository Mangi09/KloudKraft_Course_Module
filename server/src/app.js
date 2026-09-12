const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const cohortsRouter = require("./routes/cohorts.routes");
const usersRouter = require("./routes/users.routes");
const coursesRouter = require("./routes/courses.routes");
const sectionsRouter = require("./routes/sections.routes");
const lessonsRouter = require("./routes/lessons.routes");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cohorts", cohortsRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/lessons", lessonsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

// Error handler
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