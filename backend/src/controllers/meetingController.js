const Meeting = require("../models/Meeting");
const User = require("../models/User");
const { createNotifications, logAudit } = require("../utils/activity");

async function listMeetings(req, res) {
  const query = {};

  if (req.query.projectId) {
    query.project = req.query.projectId;
  }

  if (req.user.role === "client") {
    query.participants = req.user._id;
  }

  const meetings = await Meeting.find(query)
    .populate("participants", "fullName name email role avatarUrl avatarSeed")
    .sort({ scheduledAt: 1 });

  return res.json(meetings);
}

async function createMeeting(req, res) {
  const meeting = await Meeting.create(req.body);

  await logAudit({
    action: "MEETING_CREATED",
    actor: req.user._id,
    project: meeting.project,
    metadata: { title: meeting.title },
  });

  await createNotifications(
    (meeting.participants || []).map((participant) => ({
      user: participant,
      type: "MEETING_CREATED",
      title: "Meeting scheduled",
      message: `${meeting.title} has been scheduled.`,
      relatedProject: meeting.project,
      actionUrl: `/admin/meetings`,
    })),
  );

  return res.status(201).json(
    await Meeting.findById(meeting._id).populate("participants", "fullName name email role avatarUrl avatarSeed"),
  );
}

module.exports = {
  listMeetings,
  createMeeting,
};
