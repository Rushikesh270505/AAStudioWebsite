const Notification = require("../models/Notification");

async function listNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return res.json(notifications);
}

async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { read: true } },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found." });
  }

  return res.json(notification);
}

module.exports = {
  listNotifications,
  markNotificationRead,
};
