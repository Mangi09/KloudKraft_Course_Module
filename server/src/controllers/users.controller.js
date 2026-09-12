const bcrypt = require("bcrypt");
const db = require("../db");

const ALLOWED_ROLES = ["ADMIN", "TRAINER", "CANDIDATE"];

async function createUser(req, res, next) {
  try {
    const {
      username,
      email,
      password,
      role,
      cohort_id,
    } = req.body;

    // Validate required fields
    if (!username || !username.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Username is required.",
        },
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Email is required.",
        },
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 6 characters.",
        },
      });
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Role must be ADMIN, TRAINER, or CANDIDATE.",
        },
      });
    }

    // Check whether the email already exists
    const existingUser = await db("users")
      .where({ email: email.trim() })
      .first();

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: "DUPLICATE_EMAIL",
          message: "A user with this email already exists.",
        },
      });
    }

    // Validate cohort if provided
    let cohortId = null;

    if (cohort_id !== undefined && cohort_id !== null && cohort_id !== "") {
      const cohort = await db("cohorts")
        .where({ id: cohort_id })
        .first();

      if (!cohort) {
        return res.status(400).json({
          error: {
            code: "INVALID_COHORT",
            message: "The selected cohort does not exist.",
          },
        });
      }

      cohortId = cohort.id;
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10);

    const [id] = await db("users").insert({
      username: username.trim(),
      email: email.trim(),
      password_hash: passwordHash,
      role,
      cohort_id: cohortId,
    });

    const user = await db("users")
      .select(
        "id",
        "username",
        "email",
        "role",
        "cohort_id",
        "created_at",
        "updated_at"
      )
      .where({ id })
      .first();

    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await db("users")
      .select(
        "id",
        "username",
        "email",
        "role",
        "cohort_id",
        "created_at",
        "updated_at"
      )
      .orderBy("id", "desc");

    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUser,
  listUsers,
};