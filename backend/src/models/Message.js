const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    body: {
      type: String,
      required: true,
    },
    kind: {
      type: String,
      enum: ["CHAT", "SYSTEM"],
      default: "CHAT",
    },
    attachmentUrl: String,
    readAt: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Message", messageSchema);
