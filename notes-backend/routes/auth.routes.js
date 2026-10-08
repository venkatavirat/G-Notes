const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

function findUserByEmail(email) {
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return User.findOne({
    email: { $regex: `^${escapedEmail}$`, $options: "i" }
  });
}

router.post("/register", async (req, res) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({ message: "Authentication is unavailable." });
  }

  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    });

    res.status(201).json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    console.error("Registration error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Unable to register account." });
  }
});

router.post("/login", async (req, res) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({ message: "Authentication is unavailable." });
  }

  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to log in." });
  }
});

module.exports = router;