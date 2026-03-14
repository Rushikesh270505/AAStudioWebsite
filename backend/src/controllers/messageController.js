const Message = require("../models/Message");
const Project = require("../models/Project");

async function listMessages(req, res) {
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ message: "projectId query parameter is required." });
  }

  const messages = await Message.find({ project: projectId })
    .populate("sender", "name role")
    .populate("recipient", "name role")
    .sort({ createdAt: 1 });

  return res.json(messages);
}

async function createMessage(req, res) {
  const { projectId, recipientId, body } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  const message = await Message.create({
    project: projectId,
    sender: req.user._id,
    recipient: recipientId || undefined,
    body,
  });

  const populatedMessage = await message.populate("sender", "name role");

  return res.status(201).json(populatedMessage);
}

module.exports = {
  listMessages,
  createMessage,
};
