const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    conceptClarity: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    lectureStructure: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    subjectMastery: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    practicalUnderstanding: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    studentEngagement: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    lecturePace: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    learningOutcomeImpact: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  { _id: false },
);

const feedbackSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    rollNo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
    },

    remark: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

feedbackSchema.index({ session: 1, rollNo: 1 }, { unique: true });

feedbackSchema.pre("save", function (next) {
  const values = Object.values(this.rating || {});
  this.avgRating = values.reduce((sum, v) => sum + v, 0) / values.length;

  next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
