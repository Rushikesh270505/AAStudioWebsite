const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

function signToken(id) {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studioName: user.studioName,
  };
}

async function register(req, res) {
  const { name, email, password, role, studioName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists." });
  }

  const user = await User.create({ name, email, password, role, studioName });
  const token = signToken(user._id.toString());

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user._id.toString());

  return res.json({
    token,
    user: sanitizeUser(user),
  });
}

async function getCurrentUser(req, res) {
  return res.json({
    user: sanitizeUser(req.user),
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
