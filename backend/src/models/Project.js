const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    title: String,
    status: String,
    date: String,
    note: String,
  },
  { _id: false },
);

const coordinatesSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    projectType: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Concept", "In Construction", "Completed"],
      default: "Concept",
    },
    heroImage: String,
    year: String,
    area: String,
    duration: String,
    coordinates: coordinatesSchema,
    modelUrl: String,
    walkthroughUrl: String,
    architect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileAsset",
      },
    ],
    timeline: [timelineSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Project", projectSchema);
