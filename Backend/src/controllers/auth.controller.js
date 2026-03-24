const crypto = require("crypto");
const User = require("../models/user.model.js");
const asyncHandler = require("../utils/async.handler.js");
const ApiError = require("../utils/api.error.js");
const sendResponse = require("../utils/response.helper.js");
const emailTransporter = require("../config/email.js");
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
  const { fullName, email, password, role, department, designation } = req.body;

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
    subjects: [],
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

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "User email is required");
  }

  const user = await User.findOne({ email }).select(
    "+passwordResetOtp +passwordResetOtpExpires +passwordResetOtpVerified",
  );

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  user.passwordResetOtp = hashedOtp;
  user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetOtpVerified = false;

  await user.save({ validateBeforeSave: false });

  await emailTransporter.sendMail({
    to: user.email,
    from: process.env.EMAIL_FROM || "no-reply@classbuddy.local",
    subject: "Password Reset OTP",
    text: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`,
    html: `<p>Your password reset OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  });

  return sendResponse(res, 200, "OTP sent to your email address");
});

const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email }).select(
    "+passwordResetOtp +passwordResetOtpExpires +passwordResetOtpVerified",
  );

  if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
    throw new ApiError(400, "No OTP request found for this email");
  }

  if (user.passwordResetOtpExpires < Date.now()) {
    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;
    user.passwordResetOtpVerified = false;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedOtp !== user.passwordResetOtp) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.passwordResetOtpVerified = true;
  await user.save({ validateBeforeSave: false });

  return sendResponse(res, 200, "OTP verified successfully");
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    throw new ApiError(
      400,
      "Email, new password and confirm password are required",
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const user = await User.findOne({ email }).select(
    "+password +passwordResetOtpVerified +passwordResetOtpExpires",
  );

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  if (!user.passwordResetOtpVerified || !user.passwordResetOtpExpires) {
    throw new ApiError(
      400,
      "OTP verification is required before resetting password",
    );
  }

  if (user.passwordResetOtpExpires < Date.now()) {
    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;
    user.passwordResetOtpVerified = false;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  user.password = newPassword;
  user.passwordResetOtp = null;
  user.passwordResetOtpExpires = null;
  user.passwordResetOtpVerified = false;

  await user.save();

  return sendResponse(res, 200, "Password updated successfully");
});

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
