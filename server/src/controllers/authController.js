const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { message: "Email and password are required", status: 400 },
      });
    }

    const user = await db("users").where({ email }).first();

    if (!user) {
      return res.status(401).json({
        error: { message: "Invalid email or password", status: 401 },
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: { message: "Invalid email or password", status: 401 },
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        cohort_id: user.cohort_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        cohort_id: user.cohort_id,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };