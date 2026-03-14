const express = require("express");
const { addSubjects } = require("../controllers/subject.controller.js");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post(
  "/add/:userId",
  authMiddleware,
  authorizeRoles("Admin"),
  addSubjects,
);

module.exports = router;
