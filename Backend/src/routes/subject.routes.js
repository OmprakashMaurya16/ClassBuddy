const express = require("express");
const {
  addSubjects,
  getMySubjects,
  getSubjectsByFacultyIdForHod,
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

router.get(
  "/faculty/:facultyId",
  authMiddleware,
  authorizeRoles("HOD"),
  getSubjectsByFacultyIdForHod,
);

module.exports = router;
