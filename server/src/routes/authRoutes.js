const express = require("express");
const { login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);

// Quick test route to verify authMiddleware works
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;