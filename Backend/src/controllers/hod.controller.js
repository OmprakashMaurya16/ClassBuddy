const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Feedback = require("../models/feedback.model.js");
const asyncHandler = require("../utils/async.handler.js");
const ApiError = require("../utils/api.error.js");
const sendResponse = require("../utils/response.helper.js");

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const getHodDashboard = asyncHandler(async (req, res) => {
  const department = req.user?.department;

  if (!department) {
    throw new ApiError(400, "Department is required");
  }

  const faculties = await User.find({
    role: "Faculty",
    department,
    isActive: true,
  })
    .populate("subjects")
    .sort({ fullName: 1 });

  const facultyIds = faculties.map((f) => f._id);

  const ratings = await Feedback.aggregate([
    {
      $match: {
        faculty: { $in: facultyIds },
      },
    },
    {
      $group: {
        _id: "$faculty",
        avgRating: { $avg: "$averageRating" },
        total: { $sum: 1 },
      },
    },
  ]);

  const ratingMap = new Map(
    ratings.map((r) => [
      String(r._id),
      { avgRating: r.avgRating, total: r.total },
    ]),
  );

  const deptAgg = await Feedback.aggregate([
    {
      $match: {
        faculty: { $in: facultyIds },
      },
    },
    {
      $group: {
        _id: null,
        deptAvgScore: { $avg: "$averageRating" },
      },
    },
  ]);

  const deptAvgScore = deptAgg?.[0]?.deptAvgScore;

  const data = faculties.map((faculty) => {
    const rating = ratingMap.get(String(faculty._id));

    return {
      _id: faculty._id,
      fullName: faculty.fullName,
      email: faculty.email,
      role: faculty.role,
      department: faculty.department,
      designation: faculty.designation,
      avgRating:
        rating && Number.isFinite(rating.avgRating)
          ? round2(rating.avgRating)
          : null,
      totalFeedback: rating?.total || 0,
      subjects: (faculty.subjects || []).map((s) => ({
        _id: s._id,
        name: s.name,
        code: s.code,
        department: s.department,
        semester: s.semester,
      })),
    };
  });

  return sendResponse(res, 200, "HOD dashboard", {
    stats: {
      totalFaculty: faculties.length,
      deptAvgScore: deptAvgScore == null ? 0 : round2(deptAvgScore),
    },
    faculties: data,
  });
});

module.exports = {
  getHodDashboard,
};
