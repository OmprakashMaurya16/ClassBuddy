const express = require("express");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware.js");
const { getHodDashboard } = require("../controllers/hod.controller.js");

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("HOD"),
  getHodDashboard,
);

module.exports = router;
