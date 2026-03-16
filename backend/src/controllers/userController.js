const crypto = require("crypto");
const User = require("../models/User");
const Invite = require("../models/Invite");
const Project = require("../models/Project");
const WorkReport = require("../models/WorkReport");
const ProjectCollaborator = require("../models/ProjectCollaborator");
const ProjectUpdate = require("../models/ProjectUpdate");
const FileAsset = require("../models/FileAsset");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const Meeting = require("../models/Meeting");
const SiteVisit = require("../models/SiteVisit");
const AuditLog = require("../models/AuditLog");
const { buildAvatarUrl } = require("../utils/avatar");
const { createNotifications, logAudit } = require("../utils/activity");

function normalizeArchitectUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9@._-]/g, "");
}

async function ensureArchitectCredentialsAvailable({ userId, email, username }) {
  const emailQuery = {
    email,
    ...(userId ? { _id: { $ne: userId } } : {}),
  };
  const existingEmailUser = await User.findOne(emailQuery).select("_id");

  if (existingEmailUser) {
    throw new Error("That email is already used by another account.");
  }

  if (!username) {
    return;
  }

  const usernameQuery = {
    username,
    ...(userId ? { _id: { $ne: userId } } : {}),
  };
  const existingUsernameUser = await User.findOne(usernameQuery).select("_id");

  if (existingUsernameUser) {
    throw new Error("That username is already used by another account.");
  }
}

async function listArchitects(req, res) {
  const architects = await User.find({ role: "architect", isActive: true })
    .select("fullName name username email role avatarUrl avatarSeed companyArchitectId specializationTags studioName isOnline lastLoginAt lastReportAt")
    .sort({ fullName: 1 });

  const projects = await Project.find({ mainArchitect: { $in: architects.map((architect) => architect._id) } }).select(
    "mainArchitect status",
  );

  const workload = architects.map((architect) => {
    const assigned = projects.filter((project) => project.mainArchitect?.toString() === architect._id.toString());
    return {
      ...architect.toObject(),
      workload: {
        total: assigned.length,
        active: assigned.filter((project) => ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(project.status)).length,
        review: assigned.filter((project) => project.status === "READY_FOR_REVIEW").length,
      },
    };
  });

  return res.json(workload);
}

async function listUsers(req, res) {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return res.json(users);
}

async function updateProfile(req, res) {
  const { fullName, phone, studioName, avatarSeed, bio } = req.body;
  const update = {
    fullName: fullName || req.user.fullName,
    name: fullName || req.user.name,
    phone,
    studioName,
    bio,
  };

  if (avatarSeed) {
    update.avatarSeed = avatarSeed;
    update.avatarUrl = buildAvatarUrl(avatarSeed);
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select("-password");
  return res.json(user);
}

async function createArchitect(req, res) {
  const { username, fullName, email, phone, specializationTags = [], companyArchitectId, archivedSourceId } = req.body;
  const providedPassword = typeof req.body.password === "string" ? req.body.password.trim() : "";
  const generatedPassword = crypto.randomBytes(8).toString("base64url");
  const password = providedPassword || generatedPassword;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedUsername = normalizeArchitectUsername(username);

  if (providedPassword && providedPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  const displayName = fullName || username;

  if (!displayName || !normalizedEmail || !normalizedUsername) {
    return res.status(400).json({ message: "Username and email are required." });
  }

  try {
    if (archivedSourceId) {
      const architect = await User.findOne({ _id: archivedSourceId, role: "architect", isActive: false }).select("+password");

      if (!architect) {
        return res.status(404).json({ message: "Archived architect not found." });
      }

      await ensureArchitectCredentialsAvailable({
        userId: architect._id,
        email: normalizedEmail,
        username: normalizedUsername,
      });

      const avatarSeed = `${displayName}-${crypto.randomBytes(4).toString("hex")}`;

      architect.fullName = displayName;
      architect.name = displayName;
      architect.username = normalizedUsername;
      architect.email = normalizedEmail;
      architect.password = password;
      architect.phone = phone || architect.archivedPhone || "";
      architect.role = "architect";
      architect.specializationTags = specializationTags;
      architect.companyArchitectId = companyArchitectId || `ARCH-${Date.now()}`;
      architect.avatarSeed = avatarSeed;
      architect.avatarUrl = buildAvatarUrl(avatarSeed);
      architect.isActive = true;
      architect.isOnline = false;
      architect.archivedEmail = undefined;
      architect.archivedPhone = undefined;
      architect.archivedAt = undefined;
      architect.onboardingCompleted = true;
      await architect.save();

      await logAudit({
        action: "ARCHITECT_REACTIVATED",
        actor: req.user._id,
        targetUser: architect._id,
      });

      const safeArchitect = await User.findById(architect._id).select("-password");

      return res.status(201).json({
        user: safeArchitect,
        temporaryPassword: providedPassword ? undefined : generatedPassword,
        message: `Architect account reactivated for ${safeArchitect.username || safeArchitect.fullName}.`,
      });
    }

    await ensureArchitectCredentialsAvailable({
      email: normalizedEmail,
      username: normalizedUsername,
    });

    const avatarSeed = `${displayName}-${crypto.randomBytes(4).toString("hex")}`;

    const user = await User.create({
      fullName: displayName,
      name: displayName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      phone,
      role: "architect",
      specializationTags,
      companyArchitectId: companyArchitectId || `ARCH-${Date.now()}`,
      avatarSeed,
      avatarUrl: buildAvatarUrl(avatarSeed),
      onboardingCompleted: true,
    });

    await logAudit({
      action: "ARCHITECT_CREATED",
      actor: req.user._id,
      targetUser: user._id,
    });

    const safeUser = await User.findById(user._id).select("-password");

    return res.status(201).json({
      user: safeUser,
      temporaryPassword: providedPassword ? undefined : generatedPassword,
      message: `Architect account created for ${safeUser.username || safeUser.fullName}.`,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    throw error;
  }
}

async function archiveArchitect(req, res) {
  const architect = await User.findOne({ _id: req.params.id, role: "architect" }).select("+password");

  if (!architect) {
    return res.status(404).json({ message: "Architect not found." });
  }

  if (!architect.isActive && architect.archivedAt) {
    return res.status(400).json({ message: "Architect has already been archived." });
  }

  const scrubSuffix = `${architect._id.toString()}-${Date.now()}`;
  const preservedName = architect.fullName || architect.username || "Archived architect";
  const originalEmail = architect.archivedEmail || architect.email;
  const originalPhone = architect.archivedPhone || architect.phone || "";

  architect.isActive = false;
  architect.isOnline = false;
  architect.archivedEmail = originalEmail;
  architect.archivedPhone = originalPhone;
  architect.archivedAt = new Date();
  architect.email = `archived-${scrubSuffix}@removed.local`;
  architect.username = `archived-${scrubSuffix}`;
  architect.password = crypto.randomBytes(24).toString("hex");
  architect.phone = "";
  architect.companyArchitectId = "";
  architect.avatarSeed = `archived-${scrubSuffix}`;
  architect.avatarUrl = buildAvatarUrl(architect.avatarSeed);
  architect.fullName = preservedName;
  architect.name = preservedName;
  architect.assignedProjects = [];
  await architect.save();

  await Promise.all([
    Project.updateMany(
      { mainArchitect: architect._id },
      {
        $unset: {
          mainArchitect: 1,
          architect: 1,
        },
      },
    ),
    Project.updateMany(
      { architect: architect._id, mainArchitect: { $ne: architect._id } },
      {
        $unset: {
          architect: 1,
        },
      },
    ),
    ProjectCollaborator.deleteMany({ architect: architect._id }),
    Meeting.updateMany({ participants: architect._id }, { $pull: { participants: architect._id } }),
    Meeting.updateMany({ createdBy: architect._id }, { $unset: { createdBy: 1 } }),
    SiteVisit.updateMany({ assignedStaff: architect._id }, { $pull: { assignedStaff: architect._id } }),
  ]);

  await logAudit({
    action: "ARCHITECT_ARCHIVED",
    actor: req.user._id,
    targetUser: architect._id,
    metadata: {
      archivedEmail: originalEmail,
      archivedPhone: originalPhone,
    },
  });

  return res.json({
    message: "Architect archived successfully. Portal access has been removed and contact details were preserved.",
    user: architect,
  });
}

async function terminateArchitect(req, res) {
  const architect = await User.findOne({ _id: req.params.id, role: "architect" }).select("+password");

  if (!architect) {
    return res.status(404).json({ message: "Architect not found." });
  }

  const architectId = architect._id;
  const userLabel = architect.username || architect.fullName || architect.email;
  await logAudit({
    action: "ARCHITECT_TERMINATED",
    actor: req.user._id,
    metadata: {
      architectId: architectId.toString(),
      email: architect.archivedEmail || architect.email,
      username: architect.username,
    },
  });

  await Promise.all([
    WorkReport.deleteMany({ architect: architectId }),
    ProjectCollaborator.deleteMany({ architect: architectId }),
    ProjectUpdate.deleteMany({ author: architectId }),
    FileAsset.deleteMany({ uploadedBy: architectId }),
    Notification.deleteMany({ user: architectId }),
    Message.deleteMany({
      $or: [{ sender: architectId }, { recipient: architectId }],
    }),
    Meeting.updateMany({ participants: architectId }, { $pull: { participants: architectId } }),
    Meeting.updateMany({ createdBy: architectId }, { $unset: { createdBy: 1 } }),
    SiteVisit.updateMany({ assignedStaff: architectId }, { $pull: { assignedStaff: architectId } }),
    Project.updateMany(
      { mainArchitect: architectId },
      {
        $unset: {
          mainArchitect: 1,
          architect: 1,
        },
      },
    ),
    Project.updateMany(
      { architect: architectId, mainArchitect: { $ne: architectId } },
      {
        $unset: {
          architect: 1,
        },
      },
    ),
    Project.updateMany({ reviewRequestedBy: architectId }, { $unset: { reviewRequestedBy: 1 } }),
    AuditLog.deleteMany({
      $or: [{ actor: architectId }, { targetUser: architectId }],
    }),
    Invite.deleteMany({
      email: {
        $in: [architect.email, architect.archivedEmail].filter(Boolean),
      },
    }),
  ]);

  await architect.deleteOne();

  return res.json({
    message: `${userLabel} was terminated permanently and can no longer access the portal.`,
  });
}

async function updateUserStatus(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        isActive: Boolean(req.body.isActive),
      },
    },
    { new: true },
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  await logAudit({
    action: "USER_STATUS_UPDATED",
    actor: req.user._id,
    targetUser: user._id,
    metadata: { isActive: user.isActive },
  });

  return res.json(user);
}

async function createInvite(req, res) {
  const { email, role, companyArchitectId } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  const invite = await Invite.create({
    email,
    role,
    invitedBy: req.user._id,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    companyArchitectId,
  });

  await logAudit({
    action: "INVITE_CREATED",
    actor: req.user._id,
    metadata: { email, role },
  });

  const existingUser = await User.findOne({ email }).select("_id");
  if (existingUser) {
    await createNotifications([
      {
        user: existingUser._id,
        type: "INVITE_CREATED",
        title: "You have been invited",
        message: `An invitation for role ${role} has been created for your email.`,
      },
    ]);
  }

  return res.status(201).json(invite);
}

async function listInvites(req, res) {
  const invites = await Invite.find().sort({ createdAt: -1 });
  return res.json(invites);
}

module.exports = {
  listArchitects,
  listUsers,
  updateProfile,
  createArchitect,
  archiveArchitect,
  terminateArchitect,
  updateUserStatus,
  createInvite,
  listInvites,
};
