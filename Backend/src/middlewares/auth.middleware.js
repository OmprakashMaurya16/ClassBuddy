const jwt = require("jsonwebtoken");
const ApiError = require("../utils/api.error.js");
const User = require("../models/user.model.js");
const asyncHanler = require("../utils/async.handler.js");

const authMiddleware = asyncHanler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Token verification error:", error.message);
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department,
    designation: user.designation,
  };

  next();
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden");
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  authorizeRoles,
};
