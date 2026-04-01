const express = require("express");
const {
  getAnalytics,
  getTimeline,
  getAnalyticsById,
} = require("../controllers/analytics.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("Faculty"), getAnalytics);

router.get("/timeline", authMiddleware, authorizeRoles("Faculty"), getTimeline);

router.get(
  "/:id/analytics",
  authMiddleware,
  authorizeRoles("HOD"),
  getAnalyticsById,
);

module.exports = router;
