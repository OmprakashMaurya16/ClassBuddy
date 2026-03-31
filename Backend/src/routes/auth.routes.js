const express = require("express");
const {
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/auth.controller.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
