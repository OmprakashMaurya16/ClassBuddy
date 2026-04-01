const crypto = require("crypto");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Session = require("../models/session.model.js");
const Subject = require("../models/subject.model.js");
const ApiError = require("../utils/api.error.js");
const asyncHandler = require("../utils/async.handler.js");
const sendResponse = require("../utils/response.helper.js");

const generateSession = asyncHandler(async (req, res) => {
  const { subjectId, date } = req.body;
  const facultyId = req.user.id;

  if (!subjectId) {
    throw new ApiError(400, "Subject is required");
  }

  const subject = await Subject.findOne({
    _id: subjectId,
    faculty: facultyId,
    isActive: true,
  });

  if (!subject) {
    throw new ApiError(404, "Subject not found for this faculty");
  }

  const qrToken = crypto.randomBytes(16).toString("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const lectureDate = date ? new Date(date) : new Date();

  const session = await Session.create({
    faculty: facultyId,
    subject: subjectId,
    date: lectureDate,
    qrToken,
    expiresAt,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const feedbackUrl = `${frontendUrl}/feedback?token=${encodeURIComponent(qrToken)}`;
  const qrDataUrl = await QRCode.toDataURL(feedbackUrl, {
    width: 512,
    margin: 2,
  });

  return sendResponse(res, 201, "Session created successfully", {
    sessionId: session._id,
    qrToken,
    feedbackUrl,
    qrDataUrl,
    expiresAt,
    subject: {
      _id: subject._id,
      name: subject.name,
      code: subject.code,
    },
  });
});

const getFacultySessions = asyncHandler(async (req, res) => {
  const facultyId = req.user.id;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const sessions = await Session.aggregate([
    {
      $match: {
        faculty: new mongoose.Types.ObjectId(facultyId),
      },
    },
    { $sort: { date: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "subjects",
        localField: "subject",
        foreignField: "_id",
        as: "subjectInfo",
      },
    },
    {
      $lookup: {
        from: "feedbacks",
        localField: "_id",
        foreignField: "session",
        as: "feedbackDocs",
      },
    },
    {
      $project: {
        _id: 1,
        date: 1,
        expiresAt: 1,
        isActive: 1,
        responses: { $size: "$feedbackDocs" },
        subject: {
          _id: { $arrayElemAt: ["$subjectInfo._id", 0] },
          name: { $arrayElemAt: ["$subjectInfo.name", 0] },
          code: { $arrayElemAt: ["$subjectInfo.code", 0] },
        },
      },
    },
  ]);

  const now = Date.now();

  const formatted = sessions.map((session) => {
    const isExpired = new Date(session.expiresAt).getTime() < now;

    let status = "Completed";
    if (session.isActive && !isExpired) {
      status = "Active";
    } else if (session.isActive && isExpired) {
      status = "Expired";
    }

    return {
      _id: session._id,
      date: session.date,
      subject: session.subject?.name || "Unknown Subject",
      subjectCode: session.subject?.code || "",
      responses: session.responses,
      status,
    };
  });

  return sendResponse(res, 200, "Faculty sessions", formatted);
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
  getFacultySessions,
};
