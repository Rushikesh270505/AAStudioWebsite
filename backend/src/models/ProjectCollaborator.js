const mongoose = require("mongoose");

const projectCollaboratorSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    architect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

projectCollaboratorSchema.index({ project: 1, architect: 1 }, { unique: true });

module.exports = mongoose.model("ProjectCollaborator", projectCollaboratorSchema);
