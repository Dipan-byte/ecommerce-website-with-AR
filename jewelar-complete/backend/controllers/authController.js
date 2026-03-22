// controllers/authController.js — Register, Login, Logout, Me

const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { generateToken } = require("../middleware/authMiddleware");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password });

  // Set JWT in cookie
  generateToken(res, user._id);

  res.status(201).json({
    success: true,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // Explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  generateToken(res, user._id);

  res.json({
    success: true,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
});

// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // expire immediately
  });
  res.json({ success: true, message: "Logged out successfully" });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      avatar:  user.avatar,
      wishlist: user.wishlist,
    },
  });
});

module.exports = { register, login, logout, getMe };
