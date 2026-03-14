const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    label: String,
    amount: Number,
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Due", "Paid", "Overdue"],
      default: "Draft",
    },
    pdfUrl: String,
    lineItems: [lineItemSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
