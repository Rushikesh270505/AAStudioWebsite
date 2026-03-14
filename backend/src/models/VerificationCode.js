const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["signup", "login", "reset"],
      default: "signup",
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    verifiedAt: Date,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("VerificationCode", verificationCodeSchema);
