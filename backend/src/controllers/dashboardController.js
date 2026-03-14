const Project = require("../models/Project");
const Message = require("../models/Message");
const Invoice = require("../models/Invoice");
const FileAsset = require("../models/FileAsset");

async function getClientDashboard(req, res) {
  const query = req.user.role === "client" ? { client: req.user._id } : {};
  const projects = await Project.find(query)
    .populate("architect", "name email")
    .populate("client", "name email")
    .populate("files")
    .sort({ updatedAt: -1 });

  const projectIds = projects.map((project) => project._id);
  const [messages, invoices, files] = await Promise.all([
    Message.find({ project: { $in: projectIds } }).populate("sender", "name role").sort({ createdAt: -1 }).limit(10),
    Invoice.find({ project: { $in: projectIds } }).sort({ dueDate: 1 }),
    FileAsset.find({ project: { $in: projectIds } }).sort({ updatedAt: -1 }).limit(20),
  ]);

  return res.json({
    projects,
    messages,
    invoices,
    files,
  });
}

async function getArchitectDashboard(req, res) {
  const projects = await Project.find()
    .populate("client", "name email")
    .populate("architect", "name email")
    .sort({ updatedAt: -1 });

  return res.json({
    projects,
    totals: {
      totalProjects: projects.length,
      activeProjects: projects.filter((project) => project.status !== "Completed").length,
      completedProjects: projects.filter((project) => project.status === "Completed").length,
    },
  });
}

module.exports = {
  getClientDashboard,
  getArchitectDashboard,
};
