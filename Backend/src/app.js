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

app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  if (err.name === "ApiError") {
    return sendResponse(res, err.statusCode, err.message);
  }

  console.error(err.message);

  return sendResponse(res, 500, "Internal Server Error");
});
module.exports = app;
