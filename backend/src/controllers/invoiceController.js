const Invoice = require("../models/Invoice");

async function listInvoices(req, res) {
  const query = {};

  if (req.query.projectId) {
    query.project = req.query.projectId;
  }

  if (req.user.role === "client") {
    query.client = req.user._id;
  }

  const invoices = await Invoice.find(query)
    .populate("client", "name email")
    .populate("project", "title slug")
    .sort({ dueDate: 1 });

  return res.json(invoices);
}

async function createInvoice(req, res) {
  const invoice = await Invoice.create(req.body);
  return res.status(201).json(invoice);
}

async function updateInvoiceStatus(req, res) {
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: req.body.status,
      },
    },
    { new: true },
  );

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found." });
  }

  return res.json(invoice);
}

module.exports = {
  listInvoices,
  createInvoice,
  updateInvoiceStatus,
};
