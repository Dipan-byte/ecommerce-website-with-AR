// controllers/userController.js — Admin: manage users

const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user });
});

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.name  = req.body.name  || user.name;
  user.email = req.body.email || user.email;
  user.role  = req.body.role  || user.role;
  const updated = await user.save();
  res.json({
    success: true,
    user: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role },
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete admin user");
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
