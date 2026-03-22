// middleware/authMiddleware.js — JWT Auth + Admin Guard

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ─── Protect: verify JWT from HTTP-only cookie ────────────────────────────────
const protect = async (req, res, next) => {
  try {
    // Token lives in HTTP-only cookie named "jwt"
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, please login" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

// ─── Admin: only allow admin role ─────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Admin access required" });
};

// ─── Helper: generate + set JWT cookie ───────────────────────────────────────
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,                             // not accessible via JS
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,           // 7 days
  });

  return token;
};

module.exports = { protect, adminOnly, generateToken };
