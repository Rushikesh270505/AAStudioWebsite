const mongoose = require("mongoose");
const {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SERVICE_TYPES,
} = require("../utils/constants");

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

const paymentMilestoneSchema = new mongoose.Schema(
  {
    label: String,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Paid", "Overdue"],
      default: "Pending",
    },
  },
  { _id: false },
);

const quotationSchema = new mongoose.Schema(
  {
    amount: Number,
    currency: {
      type: String,
      default: "USD",
    },
    summary: String,
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    category: {
      type: String,
      required: true,
      default: "Planning Residential",
    },
    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      default: "Planning Residential",
    },
    summary: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "PENDING",
    },
    priority: {
      type: String,
      enum: PROJECT_PRIORITIES,
      default: "MEDIUM",
    },
    deadline: Date,
    heroImage: String,
    gallery: [String],
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
    mainArchitect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    readyForReviewAt: Date,
    completedAt: Date,
    reviewRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    latestReportAt: Date,
    quotation: quotationSchema,
    paymentMilestones: [paymentMilestoneSchema],
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileAsset",
      },
    ],
    timeline: [timelineSchema],
    tags: [String],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Project", projectSchema);
