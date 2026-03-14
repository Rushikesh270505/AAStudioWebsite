const mongoose = require("mongoose");
const { MEETING_STATUSES } = require("../utils/constants");

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    notes: String,
    status: {
      type: String,
      enum: MEETING_STATUSES,
      default: "SCHEDULED",
    },
    location: String,
    outcome: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Meeting", meetingSchema);
