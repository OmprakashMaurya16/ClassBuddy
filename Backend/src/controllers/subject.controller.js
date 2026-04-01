const Subject = require("../models/subject.model.js");
const User = require("../models/user.model.js");
const ApiError = require("../utils/api.error.js");
const sendResponse = require("../utils/response.helper.js");
const asyncHandler = require("../utils/async.handler.js");

const addSubjects = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, code, department, semester } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  if (!name || !code || !department || !semester) {
    return next(new ApiError(400, "All fields are required"));
  }

  const subject = await Subject.create({
    name,
    code,
    semester,
    department,
    faculty: user._id,
  });

  user.subjects.push(subject._id);
  await user.save();

  sendResponse(res, 200, "Subjects added successfully", subject);
});

const getMySubjects = asyncHandler(async (req, res) => {
  const facultyId = req.user.id;

  const subjects = await Subject.find({
    faculty: facultyId,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .select("name code semester department");

  return sendResponse(res, 200, "Subjects fetched successfully", subjects);
});

module.exports = {
  addSubjects,
  getMySubjects,
};
