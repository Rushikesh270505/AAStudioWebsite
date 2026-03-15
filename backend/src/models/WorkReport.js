const mongoose = require("mongoose");

const workReportSchema = new mongoose.Schema(
  {
    architect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        name: {
          type: String,
          trim: true,
        },
        dataUrl: {
          type: String,
          trim: true,
        },
      },
    ],
    reportDateKey: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("WorkReport", workReportSchema);
