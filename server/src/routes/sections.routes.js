const express = require("express");
const {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} = require("../controllers/sections.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncHandler(createSection));
router.patch("/reorder", asyncHandler(reorderSections));
router.patch("/:id", asyncHandler(updateSection));
router.delete("/:id", asyncHandler(deleteSection));

module.exports = router;
