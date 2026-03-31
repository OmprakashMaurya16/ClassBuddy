const Feedback = require("../models/feedback.model.js");
const Session = require("../models/session.model.js");
const ApiError = require("../utils/api.error.js");
const asyncHandler = require("../utils/async.handler.js");
const sendResponse = require("../utils/response.helper.js");

const submitFeedback = asyncHandler(async (req, res) => {
  const { token, studentName, rollNo, rating, remark } = req.body;

  if (!token) {
    throw new ApiError(400, "session token is required");
  }

  const session = await Session.findOne({ qrToken: token });

  if (!session) {
    throw new ApiError(404, "Invalid session");
  }

  if (!session.isActive || session.expiresAt < new Date()) {
    throw new ApiError(400, "Session expired");
  }

  if (!studentName || !rollNo) {
    throw new ApiError(400, "Student details required");
  }

  const requiredFields = [
    "conceptClarity",
    "lectureStructure",
    "subjectMastery",
    "practicalUnderstanding",
    "studentEngagement",
    "lecturePace",
    "learningOutcomeImpact",
  ];

  for (const field of requiredFields) {
    if (rating?.[field] === undefined) {
      throw new ApiError(400, "All rating fields required");
    }
  }

  const existing = await Feedback.findOne({
    session: session._id,
    rollNo: rollNo.trim().toUpperCase(),
  });

  if (existing) {
    throw new ApiError(409, "Feedback already submitted");
  }

  const feedback = await Feedback.create({
    session: session._id,
    faculty: session.faculty,
    subject: session.subject,
    studentName: studentName.trim().toLowerCase(),
    rollNo: rollNo.trim().toUpperCase(),
    rating,
    remark: remark || "",
  });

  process.nextTick(async () => {
    try {
      const mlInput = {
        ratings: {
          conceptClarity: rating.conceptClarity,
          lectureStructure: rating.lectureStructure,
          subjectMastery: rating.subjectMastery,
          practicalUnderstanding: rating.practicalUnderstanding,
          studentEngagement: rating.studentEngagement,
          lecturePace: rating.lecturePace,
          learningOutcomeImpact: rating.learningOutcomeImpact,
        },
        remark: remark || "",
      };

      const sentiment = await getSentimentFromML(mlInput);

      await Feedback.findByIdAndUpdate(feedback._id, {
        sentiment,
      });
    } catch (error) {
      console.error("ML sentiment failed:", error);
    }

    return sendResponse(res, 201, "Feedback submitted successfully");
  });
});

module.exports = {
  submitFeedback,
};
