const Meeting = require("../models/Meeting");
const User = require("../models/User");
const { createNotifications, logAudit } = require("../utils/activity");

const participantSelect = "fullName name username email role avatarUrl avatarSeed isOnline";

async function listMeetings(req, res) {
  const query = {};

  if (req.query.projectId) {
    query.project = req.query.projectId;
  }

  if (["client", "architect"].includes(req.user.role)) {
    query.participants = req.user._id;
  }

  const meetings = await Meeting.find(query)
    .populate("participants", participantSelect)
    .populate("createdBy", "fullName name username email role avatarUrl avatarSeed")
    .sort({ scheduledAt: 1 });

  return res.json(meetings);
}

async function createMeeting(req, res) {
  const title = String(req.body.title || req.body.subject || "").trim();
  const description = String(req.body.description || req.body.notes || "").trim();
  const meetLink = String(req.body.meetLink || "").trim();
  const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
  const participantIds = Array.isArray(req.body.participants) ? [...new Set(req.body.participants)] : [];

  if (!title || !scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    return res.status(400).json({ message: "Subject, date, and time are required." });
  }

  if (!participantIds.length) {
    return res.status(400).json({ message: "Add at least one architect or client to the meeting." });
  }

  const users = await User.find({ _id: { $in: participantIds }, role: { $in: ["client", "architect"] }, isActive: true }).select(
    "_id role",
  );

  if (!users.length) {
    return res.status(400).json({ message: "No valid meeting participants were found." });
  }

  const meeting = await Meeting.create({
    title,
    subject: title,
    project: req.body.project || undefined,
    scheduledAt,
    participants: users.map((user) => user._id),
    notes: description,
    description,
    status: "SCHEDULED",
    location: req.body.location || "Google Meet",
    meetLink: meetLink || undefined,
    createdBy: req.user._id,
  });

  await logAudit({
    action: "MEETING_CREATED",
    actor: req.user._id,
    project: meeting.project,
    metadata: { title: meeting.title },
  });

  await createNotifications(
    users.map((participant) => ({
      user: participant._id,
      type: "MEETING_CREATED",
      title: "Meeting scheduled",
      message: `${meeting.title} has been scheduled.`,
      relatedProject: meeting.project,
      actionUrl: `/${participant.role}/meetings`,
    })),
  );

  return res.status(201).json(
    await Meeting.findById(meeting._id)
      .populate("participants", participantSelect)
      .populate("createdBy", "fullName name username email role avatarUrl avatarSeed"),
  );
}

module.exports = {
  listMeetings,
  createMeeting,
};
