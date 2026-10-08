const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address."]
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);