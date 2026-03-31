const express = require("express");
const {
  generateSession,
  validateSession,
  closeSession,
} = require("../controllers/session.controller.js");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post(
  "/sessions/generate",
  authMiddleware,
  authorizeRoles("Faculty"),
  generateSession,
);

router.get("/sessions/:token", validateSession);

router.patch(
  "/sessions/:sessionId/close",
  authMiddleware,
  authorizeRoles("Faculty"),
  closeSession,
);

module.exports = router;
