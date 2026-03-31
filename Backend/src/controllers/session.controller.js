const crypto = require("crypto");
const Session = require("../models/session.model.js");
const ApiError = require("../utils/api.error.js");
const asyncHandler = require("../utils/async.handler.js");
const sendResponse = require("../utils/response.helper.js");

const generateSession = asyncHandler(async () => {
  const { subjectId } = req.body;
  const facultyId = req.user.id;

  if (!subjectId) {
    throw new ApiError(400, "Subject is required");
  }

  const sessionId = crypto.randomBytes(16).toString("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const session = await Session.create({
    faculty: facultyId,
    subject: subjectId,
    date: new Date(),
    qrToken,
    expiresAt,
  });

  const feedbackUrl = `${process.env.FRONTEND_URL}/feedback?token=${qrToken}`;

  return sendResponse(res, 201, "Session created successfully", {
    sessionId: session._id,
    qrToken,
    feedbackUrl,
    expiresAt,
  });
});

const validateSession = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, "Token required");
  }

  const session = await Session.findOne({ qrToken: token })
    .populate("faculty", "fullName")
    .populate("subject", "name");

  if (!session) {
    throw new ApiError(404, "Invalid session");
  }

  if (!session.isActive || session.expiresAt < new Date()) {
    throw new ApiError(400, "Session expired");
  }

  return sendResponse(res, 200, "Session valid", {
    sessionId: session._id,
    faculty: session.faculty,
    subject: session.subject,
  });
});

const closeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const facultyId = req.user.id;

  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.faculty.toString() !== facultyId) {
    throw new ApiError(403, "Not allowed");
  }

  session.isActive = false;
  await session.save();

  return sendResponse(res, 200, "Session closed");
});

module.exports = {
  generateSession,
  validateSession,
  closeSession,
};
