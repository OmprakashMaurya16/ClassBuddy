const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    date: {
      type: Date,
      required: true,
    },

    qrToken: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ faculty: 1, subject: 1, date: 1 }, { unique: true });

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
