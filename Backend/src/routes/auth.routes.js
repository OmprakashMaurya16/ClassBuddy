const express = require("express");
const {
  login,
  register,
  logout,
  refreshToken,
} = require("../controllers/auth.controller.js");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/login", login);
router.post("/register", authMiddleware, authorizeRoles("Admin"), register);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", refreshToken);

module.exports = router;
