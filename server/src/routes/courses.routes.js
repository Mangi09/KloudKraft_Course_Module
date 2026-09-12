const express = require("express");
const {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses.controller");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");

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

router.use(authMiddleware);

router.get("/", asyncHandler(listCourses));

router.post(
  "/",
  requireAdmin,
  asyncHandler(createCourse)
);

router.get(
  "/:id",
  asyncHandler(getCourseById)
);

router.put(
  "/:id",
  requireAdmin,
  asyncHandler(updateCourse)
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(deleteCourse)
);

module.exports = router;
