const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long"],
      maxlength: [50, "Full name must be less than 50 characters long"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },

    role: {
      type: String,
      enum: ["Admin", "HOD", "Faculty"],
      default: "Faculty",
    },

    department: {
      type: String,
      enum: ["INFT", "CMPN", "EXTC", "EXCS", "BIOMED", "FE"],
      required: function () {
        return this.role !== "Admin";
      },
      default: null,
    },

    designation: {
      type: String,
      enum: [
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer",
        "Guest Faculty",
        "Head of Department",
      ],
      required: function () {
        return this.role !== "Admin";
      },
      default: null,
    },

    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        default: [],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetOtp: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOtpExpires: {
      type: Date,
      select: false,
      default: null,
    },

    passwordResetOtpVerified: {
      type: Boolean,
      select: false,
      default: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
