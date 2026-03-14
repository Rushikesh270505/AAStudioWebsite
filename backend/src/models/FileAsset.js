const mongoose = require("mongoose");

const fileAssetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    kind: {
      type: String,
      enum: ["image", "video", "pdf", "model", "other"],
      default: "other",
    },
    mimeType: String,
    size: Number,
    description: String,
    version: {
      type: Number,
      default: 1,
    },
    storageProvider: {
      type: String,
      enum: ["local", "s3", "cloudinary"],
      default: "local",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FileAsset", fileAssetSchema);
