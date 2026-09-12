const db = require("../db");

async function createCohort(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Cohort name is required.",
        },
      });
    }

    const [id] = await db("cohorts").insert({
      name: name.trim(),
      description: description || null,
    });

    const cohort = await db("cohorts").where({ id }).first();

    res.status(201).json({ cohort });
  } catch (err) {
    next(err);
  }
}

async function listCohorts(req, res, next) {
  try {
    const cohorts = await db("cohorts")
      .select("*")
      .orderBy("id", "desc");

    res.status(200).json({ cohorts });
  } catch (err) {
    next(err);
  }
}

async function deleteCohort(req, res, next) {
  try {
    const { id } = req.params;

    const deleted = await db("cohorts").where({ id }).del();

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Cohort not found.",
        },
      });
    }

    res.status(200).json({
      message: "Cohort deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCohort,
  listCohorts,
  deleteCohort,
};
