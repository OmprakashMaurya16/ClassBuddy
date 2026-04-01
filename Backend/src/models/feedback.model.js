const mongoose = require("mongoose");

const RATING_FIELDS = [
  "conceptClarity",
  "lectureStructure",
  "subjectMastery",
  "practicalUnderstanding",
  "studentEngagement",
  "lecturePace",
  "learningOutcomeImpact",
];

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

    rating: {
      type: ratingSchema,
      required: true,
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

feedbackSchema.pre("validate", function () {
  const values = RATING_FIELDS.map((field) => Number(this.rating?.[field]));

  if (values.some((value) => !Number.isFinite(value))) {
    this.invalidate("rating", "All rating values must be valid numbers");
    return;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  this.averageRating = Math.round((total / values.length) * 100) / 100;
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
