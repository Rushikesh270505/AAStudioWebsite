const mongoose = require("mongoose");
const { UPDATE_TYPES } = require("../utils/constants");

const projectUpdateSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updateType: {
      type: String,
      enum: UPDATE_TYPES,
      default: "PROGRESS_UPDATE",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentUrl: String,
    attachmentName: String,
    tag: String,
    parentUpdate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectUpdate",
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ProjectUpdate", projectUpdateSchema);
