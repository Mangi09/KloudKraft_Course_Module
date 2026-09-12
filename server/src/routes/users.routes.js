const express = require("express");

const {
  createUser,
  listUsers,
} = require("../controllers/users.controller");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// All user-management routes require authentication
router.use(authMiddleware);

// Only ADMIN can create and view users
router.use(roleMiddleware("ADMIN"));

router.post("/", createUser);
router.get("/", listUsers);

module.exports = router;