const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Subject name must be at least 3 characters long"],
      maxlength: [100, "Subject name must be less than 100 characters long"],
      tolowercase: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      touppercase: true,
    },

    department: {
      type: String,
      enum: ["INFT", "CMPN", "EXTC", "EXCS", "BIOMED", "FE"],
      required: true,
      uppercase: true,
    },

    semester: {
      type: Number,
      required: true,
      min: [1, "Semester must be at least 1"],
      max: [8, "Semester must be at most 8"],
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
