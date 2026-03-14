const mongoose = require("mongoose");

const contactLeadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    projectType: String,
    budget: String,
    message: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "website",
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"],
      default: "NEW",
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ContactLead", contactLeadSchema);
