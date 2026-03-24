const User = require("../models/user.model.js");
const Subject = require("../models/subject.model.js");
const asyncHandler = require("../utils/async.handler.js");
const ApiError = require("../utils/api.error.js");
const sendResponse = require("../utils/response.helper.js");
const mongoose = require("mongoose");

const ALLOWED_DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Guest Faculty",
  "Head of Department",
];

const ALLOWED_DEPARTMENTS = ["INFT", "CMPN", "EXTC", "EXCS", "BIOMED", "FE"];

const SEMESTER_TO_NUMBER = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
};

const NUMBER_TO_SEMESTER = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
};

const toSemesterNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim().toUpperCase();
    if (SEMESTER_TO_NUMBER[trimmed]) {
      return SEMESTER_TO_NUMBER[trimmed];
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return null;
};

const formatSubject = (subjectDoc) => ({
  _id: subjectDoc._id,
  name: subjectDoc.name,
  code: subjectDoc.code,
  department: subjectDoc.department,
  semester:
    NUMBER_TO_SEMESTER[subjectDoc.semester] || String(subjectDoc.semester),
});

const createFaculty = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, department, designation } = req.body;

  if (!fullName || !email || !password || !role) {
    throw new ApiError(400, "Full name, email, password and role are required");
  }

  if (!["HOD", "Faculty"].includes(role)) {
    throw new ApiError(400, "Role must be either HOD or Faculty");
  }

  if (!department || !designation) {
    throw new ApiError(400, "Department and designation are required");
  }

  if (!ALLOWED_DESIGNATIONS.includes(designation)) {
    throw new ApiError(400, "Invalid designation");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  if (role === "HOD") {
    const existingHod = await User.findOne({ role: "HOD", department });
    if (existingHod) {
      throw new ApiError(
        409,
        `A HOD already exists for the ${department} department`,
      );
    }
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role,
    department,
    designation,
    subjects: [],
  });

  return sendResponse(res, 201, "Faculty created successfully", {
    faculty: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      subjects: [],
    },
  });
});

const listFaculty = asyncHandler(async (req, res) => {
  const { search = "", dept = "", page = 1, limit = 15 } = req.query;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 15);

  const filter = { role: { $in: ["HOD", "Faculty"] } };

  if (dept) {
    filter.department = dept;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ fullName: regex }, { email: regex }];
  }

  const total = await User.countDocuments(filter);

  const faculties = await User.find(filter)
    .populate("subjects")
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  const data = faculties.map((faculty) => ({
    _id: faculty._id,
    fullName: faculty.fullName,
    email: faculty.email,
    role: faculty.role,
    department: faculty.department,
    designation: faculty.designation,
    isActive: faculty.isActive,
    subjects: (faculty.subjects || []).map(formatSubject),
  }));

  return sendResponse(res, 200, "Faculty list fetched successfully", {
    faculties: data,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
});

const getFacultyStats = asyncHandler(async (req, res) => {
  const DEPARTMENTS = ["INFT", "CMPN", "EXTC", "EXCS", "BIOMED", "FE"];
  const baseFilter = { role: { $in: ["HOD", "Faculty"] } };

  const stats = {};

  for (const dept of DEPARTMENTS) {
    stats[dept] = await User.countDocuments({
      ...baseFilter,
      department: dept,
    });
  }

  const total = Object.values(stats).reduce((sum, c) => sum + c, 0);

  return sendResponse(res, 200, "Faculty stats fetched successfully", {
    total,
    ...stats,
  });
});

const updateFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { fullName, department, designation, role } = req.body;

  const faculty = await User.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  if (role && !["HOD", "Faculty"].includes(role)) {
    throw new ApiError(400, "Role must be either HOD or Faculty");
  }

  const nextRole = role || faculty.role;
  const nextDepartment = department || faculty.department;

  if (!nextDepartment || !designation) {
    throw new ApiError(400, "Department and designation are required");
  }

  if (!ALLOWED_DESIGNATIONS.includes(designation)) {
    throw new ApiError(400, "Invalid designation");
  }

  if (nextRole === "HOD") {
    const existingHod = await User.findOne({
      _id: { $ne: faculty._id },
      role: "HOD",
      department: nextDepartment,
    });

    if (existingHod) {
      throw new ApiError(
        409,
        `A HOD already exists for the ${nextDepartment} department`,
      );
    }
  }

  faculty.fullName = fullName ? fullName.trim() : faculty.fullName;
  faculty.department = nextDepartment;
  faculty.designation = designation;
  faculty.role = nextRole;

  await faculty.save();

  return sendResponse(res, 200, "Faculty updated successfully", {
    faculty: {
      _id: faculty._id,
      fullName: faculty.fullName,
      email: faculty.email,
      role: faculty.role,
      department: faculty.department,
      designation: faculty.designation,
    },
  });
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;

  const faculty = await User.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  await Subject.deleteMany({ faculty: faculty._id });
  await User.findByIdAndDelete(faculty._id);

  return sendResponse(res, 200, "Faculty deleted successfully");
});

const addFacultySubject = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { name, code, department, semester } = req.body;

  if (!mongoose.Types.ObjectId.isValid(facultyId)) {
    throw new ApiError(400, "Invalid faculty id");
  }

  if (!name || !code || !department || !semester) {
    throw new ApiError(400, "Name, code, department and semester are required");
  }

  const normalizedDepartment = String(department).trim().toUpperCase();
  if (!ALLOWED_DEPARTMENTS.includes(normalizedDepartment)) {
    throw new ApiError(400, "Invalid department");
  }

  const faculty = await User.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  const semesterNumber = toSemesterNumber(semester);
  if (!semesterNumber || semesterNumber < 1 || semesterNumber > 8) {
    throw new ApiError(400, "Semester must be between I and VIII");
  }

  const subject = await Subject.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    department: normalizedDepartment,
    semester: semesterNumber,
    faculty: faculty._id,
  });

  await User.findByIdAndUpdate(faculty._id, {
    $addToSet: { subjects: subject._id },
  });

  return sendResponse(res, 201, "Subject added successfully", {
    subject: formatSubject(subject),
  });
});

const updateSubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const { name, code, department, semester } = req.body;

  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid subject id");
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  if (!name || !code || !department || !semester) {
    throw new ApiError(400, "Name, code, department and semester are required");
  }

  const normalizedDepartment = String(department).trim().toUpperCase();
  if (!ALLOWED_DEPARTMENTS.includes(normalizedDepartment)) {
    throw new ApiError(400, "Invalid department");
  }

  const semesterNumber = toSemesterNumber(semester);
  if (!semesterNumber || semesterNumber < 1 || semesterNumber > 8) {
    throw new ApiError(400, "Semester must be between I and VIII");
  }

  subject.name = name.trim();
  subject.code = code.trim().toUpperCase();
  subject.department = normalizedDepartment;
  subject.semester = semesterNumber;
  await subject.save();

  return sendResponse(res, 200, "Subject updated successfully", {
    subject: formatSubject(subject),
  });
});

const deleteSubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid subject id");
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  await User.findByIdAndUpdate(subject.faculty, {
    $pull: { subjects: subject._id },
  });
  await Subject.findByIdAndDelete(subject._id);

  return sendResponse(res, 200, "Subject deleted successfully");
});

module.exports = {
  createFaculty,
  listFaculty,
  getFacultyStats,
  updateFaculty,
  deleteFaculty,
  addFacultySubject,
  updateSubject,
  deleteSubject,
};
