const express = require("express");
const cors = require("cors");
const sendResponse = require("./utils/response.helper.js");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the backend of ClassBuddy Application",
  });
});

const authRoutes = require("./routes/auth.routes.js");
const subjectRoutes = require("./routes/subject.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const sessionRoutes = require("./routes/sessions.routes.js");

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", sessionRoutes);

app.use((err, req, res, next) => {
  if (err.name === "ApiError") {
    return sendResponse(res, err.statusCode, err.message);
  }

  if (err.name === "ValidationError") {
    const firstMessage = Object.values(err.errors || {})[0]?.message;
    return sendResponse(res, 400, firstMessage || "Validation failed");
  }

  if (err.name === "CastError") {
    return sendResponse(res, 400, `Invalid ${err.path}`);
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || "field";
    return sendResponse(res, 409, `Duplicate value for ${duplicateField}`);
  }

  console.error(err.message);

  return sendResponse(res, 500, "Internal Server Error");
});
module.exports = app;
