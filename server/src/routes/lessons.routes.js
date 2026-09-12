const express = require("express");
const {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} = require("../controllers/lessons.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncHandler(createLesson));
router.patch("/reorder", asyncHandler(reorderLessons));
router.patch("/:id", asyncHandler(updateLesson));
router.delete("/:id", asyncHandler(deleteLesson));

module.exports = router;
