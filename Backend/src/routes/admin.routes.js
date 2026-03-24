const express = require("express");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/auth.middleware.js");
const {
  createFaculty,
  listFaculty,
  getFacultyStats,
  updateFaculty,
  deleteFaculty,
  addFacultySubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/user.controller.js");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("Admin"));

router.get("/stats", getFacultyStats);
router.get("/faculty", listFaculty);
router.post("/faculty", createFaculty);
router.put("/faculty/:facultyId", updateFaculty);
router.delete("/faculty/:facultyId", deleteFaculty);

router.post("/faculty/:facultyId/subjects", addFacultySubject);
router.put("/subjects/:subjectId", updateSubject);
router.delete("/subjects/:subjectId", deleteSubject);

module.exports = router;
