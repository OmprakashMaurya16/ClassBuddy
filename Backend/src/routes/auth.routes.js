const express = require("express");
const {
  login,
  register,
  logout,
} = require("../controllers/auth.controller.js");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/login", login);
router.post("/register", authMiddleware, authorizeRoles("Admin"), register);
router.post("/logout", authMiddleware, logout);

module.exports = router;
