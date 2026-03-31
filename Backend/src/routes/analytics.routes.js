const express = require("express");
const {
  getAnalytics,
  getTimeline,
  getAnalyticsById,
} = require("../controllers/analytics.controller");
const { authMiddleware } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("Faculty"), getFacultyAnalytics);

router.get(
  "/timeline",
  authMiddleware,
  authorizeRoles("Faculty"),
  getFacultyTimeline,
);

router.get(
  "/:id/analytics",
  authMiddleware,
  authorizeRoles("HOD"),
  getFacultyAnalyticsById,
);

module.exports = router;
