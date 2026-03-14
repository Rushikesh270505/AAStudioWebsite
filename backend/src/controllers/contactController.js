const ContactLead = require("../models/ContactLead");
const User = require("../models/User");
const { createNotifications, logAudit } = require("../utils/activity");

async function createLead(req, res) {
  const { fullName, email, phone, projectType, budget, message } = req.body;

  const lead = await ContactLead.create({
    fullName,
    email,
    phone,
    projectType,
    budget,
    message,
  });

  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  await createNotifications(
    admins.map((admin) => ({
      user: admin._id,
      type: "LEAD_CAPTURED",
      title: "New website inquiry",
      message: `${fullName} submitted a new project inquiry.`,
    })),
  );

  await logAudit({
    action: "CONTACT_LEAD_CREATED",
    metadata: { email, projectType },
  });

  return res.status(201).json({
    message: "Inquiry captured successfully.",
    leadId: lead._id,
  });
}

async function listLeads(req, res) {
  const leads = await ContactLead.find().sort({ createdAt: -1 });
  return res.json(leads);
}

module.exports = {
  createLead,
  listLeads,
};
