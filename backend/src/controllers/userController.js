const crypto = require("crypto");
const User = require("../models/User");
const Invite = require("../models/Invite");
const Project = require("../models/Project");
const { buildAvatarUrl } = require("../utils/avatar");
const { createNotifications, logAudit } = require("../utils/activity");

async function listArchitects(req, res) {
  const architects = await User.find({ role: "architect", isActive: true })
    .select("fullName name email role avatarUrl avatarSeed companyArchitectId specializationTags studioName")
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
  const { fullName, email, phone, specializationTags = [], companyArchitectId } = req.body;
  const password = req.body.password || crypto.randomBytes(8).toString("base64url");
  const avatarSeed = `${fullName}-${crypto.randomBytes(4).toString("hex")}`;

  const user = await User.create({
    fullName,
    name: fullName,
    email,
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

  return res.status(201).json({
    user,
    temporaryPassword: password,
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
  updateUserStatus,
  createInvite,
  listInvites,
};
