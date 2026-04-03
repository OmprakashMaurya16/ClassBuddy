const express = require("express");
const {
  getAnalytics,
  getTimeline,
  getAnalyticsById,
  getTimelineById,
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

router.get(
  "/:id/timeline",
  authMiddleware,
  authorizeRoles("HOD"),
  getTimelineById,
);

module.exports = router;
