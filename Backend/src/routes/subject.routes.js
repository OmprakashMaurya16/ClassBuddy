const express = require("express");
const {
  addSubjects,
  getMySubjects,
} = require("../controllers/subject.controller.js");
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

router.get("/mine", authMiddleware, authorizeRoles("Faculty"), getMySubjects);

module.exports = router;
