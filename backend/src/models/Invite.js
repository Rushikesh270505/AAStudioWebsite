const mongoose = require("mongoose");
const { USER_ROLES } = require("../utils/constants");

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: Date,
    companyArchitectId: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Invite", inviteSchema);
