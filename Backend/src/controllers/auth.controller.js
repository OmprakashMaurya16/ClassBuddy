const crypto = require("crypto");
const User = require("../models/user.model.js");
const asyncHandler = require("../utils/async.handler.js");
const ApiError = require("../utils/api.error.js");
const sendResponse = require("../utils/response.helper.js");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token.util.js");

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

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;

  await user.save();

  sendResponse(res, 200, "Login successful", {
    accessToken,
    refreshToken,
  });

  return sendResponse(res, 200, "Login successful", {
    user,
    accessToken,
    refreshToken,
  });
});

module.exports = {
  login,
};
