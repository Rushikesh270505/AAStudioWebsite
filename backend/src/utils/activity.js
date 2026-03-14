const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");

async function logAudit({ action, actor, project, targetUser, metadata = {} }) {
  return AuditLog.create({
    action,
    actor,
    project,
    targetUser,
    metadata,
  });
}

async function createNotifications(notifications) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  return Notification.insertMany(
    notifications
      .filter((item) => item.user)
      .map((item) => ({
        read: false,
        ...item,
      })),
  );
}

module.exports = {
  logAudit,
  createNotifications,
};
