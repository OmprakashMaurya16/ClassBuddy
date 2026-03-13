const crypto = require("crypto");
const User = require("../models/user.model.js");
const asyncHandler = require("../utils/async.handler.js");
const ApiError = require("../utils/api.error.js");
const sendResponse = require("../utils/response.helper.js");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token.util.js");
const cookieOptions = require("../utils/cookie.util.js");
const jwt = require("jsonwebtoken");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select(
    "+password +refreshToken +passwordChangedAt",
  );

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been deactivated. Contact admin.",
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.lastLogin = new Date();

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;

  await user.save();

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return sendResponse(res, 200, "Login successful", {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    accessToken,
    refreshToken,
  });
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, department, designation, subjects } =
    req.body;

  if (!fullName || !email || !password || !role) {
    throw new ApiError(400, "Full name, email, password and role are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  if (role === "HOD") {
    const existingHod = await User.findOne({ role: "HOD", department });
    if (existingHod) {
      throw new ApiError(
        409,
        `A HOD already exists for the ${department} department`,
      );
    }
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role,
    department: role !== "Admin" ? department : null,
    designation: role !== "Admin" ? designation : null,
    subjects: role === "Faculty" ? subjects : [],
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;

  res.cookie("refreshToken", refreshToken, cookieOptions);

  await user.save();

  return sendResponse(res, 200, "Registration successful", {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    accessToken,
    refreshToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: null },
  });

  res.clearCookie("refreshToken", cookieOptions);

  return sendResponse(res, 200, "Logged out successfully.");
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "No refresh token. Please log in again.");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    console.error("Error verifying refresh token:", error.message);
  }

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || !user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token. Please log in again.");
  }

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  if (hashedRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token. Please log in again.");
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const newHashedRefreshToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshToken = newHashedRefreshToken;

  await user.save();

  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  return sendResponse(res, 200, "Token refreshed successfully", {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

module.exports = {
  login,
  register,
  logout,
  refreshToken,
};
