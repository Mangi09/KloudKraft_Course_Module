const express = require("express");
const {
  createCourse,
  listCourses,
  getCourseById,
} = require("../controllers/courses.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Only admins can perform this action.",
      },
    });
  }

  next();
}

router.get("/", asyncHandler(listCourses));
router.post("/", requireAdmin, asyncHandler(createCourse));
router.get("/:id", asyncHandler(getCourseById));

module.exports = router;
