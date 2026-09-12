const express = require("express");
const {
  createCohort,
  listCohorts,
  deleteCohort,
} = require("../controllers/cohorts.controller");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.post("/", createCohort);
router.get("/", listCohorts);
router.delete("/:id", deleteCohort);

module.exports = router;
