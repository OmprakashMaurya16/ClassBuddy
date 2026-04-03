const Feedback = require("../models/feedback.model.js");
const asyncHandler = require("../utils/async.handler.js");
const sendResponse = require("../utils/response.helper.js");
const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const ApiError = require("../utils/api.error.js");

const buildMatchStage = (facultyId, subjectId) => {
  const match = {
    faculty: new mongoose.Types.ObjectId(facultyId),
  };

  if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
    match.subject = new mongoose.Types.ObjectId(subjectId);
  }

  return match;
};

const assertHodFacultyAccess = async ({ hodDepartment, facultyId }) => {
  if (!mongoose.Types.ObjectId.isValid(facultyId)) {
    throw new ApiError(400, "Invalid faculty id");
  }

  const faculty = await User.findById(facultyId).select(
    "role department isActive",
  );

  if (!faculty || !faculty.isActive) {
    throw new ApiError(404, "Faculty not found");
  }

  if (faculty.role !== "Faculty") {
    throw new ApiError(404, "Faculty not found");
  }

  if (!hodDepartment || faculty.department !== hodDepartment) {
    throw new ApiError(403, "Forbidden");
  }
};

const getAnalytics = asyncHandler(async (req, res) => {
  const facultyId = req.user.id;
  const { subjectId } = req.query;

  const matchStage = buildMatchStage(facultyId, subjectId);

  const stats = await Feedback.aggregate([
    { $match: matchStage },

    {
      $group: {
        _id: null,
        avgRating: { $avg: "$averageRating" },
        total: { $sum: 1 },
        positive: {
          $sum: { $cond: [{ $eq: ["$sentiment", "Positive"] }, 1, 0] },
        },
        neutral: {
          $sum: { $cond: [{ $eq: ["$sentiment", "Neutral"] }, 1, 0] },
        },
        negative: {
          $sum: { $cond: [{ $eq: ["$sentiment", "Negative"] }, 1, 0] },
        },
        conceptClarity: { $avg: "$rating.conceptClarity" },
        lectureStructure: { $avg: "$rating.lectureStructure" },
        subjectMastery: { $avg: "$rating.subjectMastery" },
        practicalUnderstanding: { $avg: "$rating.practicalUnderstanding" },
        studentEngagement: { $avg: "$rating.studentEngagement" },
        lecturePace: { $avg: "$rating.lecturePace" },
        learningOutcomeImpact: { $avg: "$rating.learningOutcomeImpact" },
      },
    },
  ]);

  const comments = await Feedback.find({
    ...matchStage,
    remark: { $ne: "" },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("remark sentiment createdAt");

  return sendResponse(res, 200, "Faculty analytics", {
    stats: stats[0] || {
      avgRating: 0,
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    comments,
  });
});

const getTimeline = asyncHandler(async (req, res) => {
  const facultyId = req.user.id;
  const { subjectId } = req.query;

  const matchStage = buildMatchStage(facultyId, subjectId);

  const data = await Feedback.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        score: { $avg: "$averageRating" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const timeline = data.map((item) => ({
    label: item._id,
    score: Math.round((item.score || 0) * 100) / 100,
    deptAvg: Math.round((item.score || 0) * 100) / 100,
  }));

  return sendResponse(res, 200, "Timeline", timeline);
});

const getAnalyticsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subjectId } = req.query;

  await assertHodFacultyAccess({
    hodDepartment: req.user?.department,
    facultyId: id,
  });

  const matchStage = buildMatchStage(id, subjectId);

  const stats = await Feedback.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$averageRating" },
        total: { $sum: 1 },
        positive: {
          $sum: { $cond: [{ $eq: ["$sentiment", "Positive"] }, 1, 0] },
        },
        neutral: {
          $sum: { $cond: [{ $eq: ["$sentiment", "Neutral"] }, 1, 0] },
        },
        negative: {
          $sum: { $cond: [{ $eq: ["$sentiment", "Negative"] }, 1, 0] },
        },
        conceptClarity: { $avg: "$rating.conceptClarity" },
        lectureStructure: { $avg: "$rating.lectureStructure" },
        subjectMastery: { $avg: "$rating.subjectMastery" },
        practicalUnderstanding: { $avg: "$rating.practicalUnderstanding" },
        studentEngagement: { $avg: "$rating.studentEngagement" },
        lecturePace: { $avg: "$rating.lecturePace" },
        learningOutcomeImpact: { $avg: "$rating.learningOutcomeImpact" },
      },
    },
  ]);

  const comments = await Feedback.find({
    ...matchStage,
    remark: { $ne: "" },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("remark sentiment createdAt");

  return sendResponse(res, 200, "Faculty analytics", {
    stats: stats[0] || {
      avgRating: 0,
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    comments,
  });
});

const getTimelineById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subjectId } = req.query;

  await assertHodFacultyAccess({
    hodDepartment: req.user?.department,
    facultyId: id,
  });

  const matchStage = buildMatchStage(id, subjectId);

  const data = await Feedback.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        score: { $avg: "$averageRating" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const timeline = data.map((item) => ({
    label: item._id,
    score: Math.round((item.score || 0) * 100) / 100,
    deptAvg: Math.round((item.score || 0) * 100) / 100,
  }));

  return sendResponse(res, 200, "Timeline", timeline);
});

module.exports = {
  getAnalytics,
  getTimeline,
  getAnalyticsById,
  getTimelineById,
};
