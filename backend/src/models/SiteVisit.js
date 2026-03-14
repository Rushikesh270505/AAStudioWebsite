const mongoose = require("mongoose");
const { SITE_VISIT_STATUSES } = require("../utils/constants");

const siteVisitSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    notes: String,
    status: {
      type: String,
      enum: SITE_VISIT_STATUSES,
      default: "SCHEDULED",
    },
    reportUrl: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("SiteVisit", siteVisitSchema);
