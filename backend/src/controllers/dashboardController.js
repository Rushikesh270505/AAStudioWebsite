const Project = require("../models/Project");
const ProjectCollaborator = require("../models/ProjectCollaborator");
const ProjectUpdate = require("../models/ProjectUpdate");
const Invoice = require("../models/Invoice");
const FileAsset = require("../models/FileAsset");
const Notification = require("../models/Notification");
const Meeting = require("../models/Meeting");
const SiteVisit = require("../models/SiteVisit");
const Invite = require("../models/Invite");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const userSelect =
  "fullName name username email role avatarUrl avatarSeed companyArchitectId specializationTags studioName isActive";

function withProjectPopulate(query) {
  return query
    .populate("client", userSelect)
    .populate("mainArchitect", userSelect)
    .populate("architect", userSelect)
    .populate("createdByAdmin", userSelect)
    .populate("files");
}

function computeProgress(status) {
  switch (status) {
    case "PENDING":
      return 12;
    case "IN_PROGRESS":
      return 56;
    case "READY_FOR_REVIEW":
      return 88;
    case "CHANGES_REQUESTED":
      return 72;
    case "COMPLETED":
      return 100;
    default:
      return 0;
  }
}

async function getCollaboratorProjectIds(userId) {
  const collaborators = await ProjectCollaborator.find({ architect: userId }).select("project");
  return collaborators.map((item) => item.project);
}

async function getClientDashboard(req, res) {
  const projects = await withProjectPopulate(
    Project.find({ client: req.user._id }).sort({ updatedAt: -1 }),
  );

  const projectIds = projects.map((project) => project._id);
  const [updates, invoices, files, notifications, meetings, siteVisits] = await Promise.all([
    ProjectUpdate.find({ project: { $in: projectIds } })
      .populate("author", userSelect)
      .sort({ createdAt: -1 })
      .limit(20),
    Invoice.find({ project: { $in: projectIds } }).sort({ dueDate: 1 }),
    FileAsset.find({ project: { $in: projectIds } }).sort({ updatedAt: -1 }).limit(20),
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
    Meeting.find({
      $or: [{ project: { $in: projectIds } }, { participants: req.user._id }],
    })
      .populate("participants", userSelect)
      .sort({ scheduledAt: 1 })
      .limit(10),
    SiteVisit.find({ project: { $in: projectIds } })
      .populate("assignedStaff", userSelect)
      .sort({ date: 1 })
      .limit(10),
  ]);

  return res.json({
    overview: {
      assignedProjects: projects.length,
      activeProjects: projects.filter((project) => project.status !== "COMPLETED").length,
      pendingInvoices: invoices.filter((invoice) => !["Paid"].includes(invoice.status)).length,
      unreadNotifications: notifications.filter((notification) => !notification.read).length,
    },
    projects: projects.map((project) => ({
      ...project.toObject(),
      progress: computeProgress(project.status),
    })),
    updates,
    invoices,
    files,
    meetings,
    siteVisits,
    notifications,
  });
}

async function getArchitectDashboard(req, res) {
  const collaboratorProjectIds = await getCollaboratorProjectIds(req.user._id);
  const architectQuery = {
    $or: [{ mainArchitect: req.user._id }, { _id: { $in: collaboratorProjectIds } }],
  };

  const [availableWorks, myProjects, notifications, meetings, siteVisits] = await Promise.all([
    withProjectPopulate(
      Project.find({
        status: "PENDING",
        $or: [{ mainArchitect: null }, { mainArchitect: { $exists: false } }],
      }).sort({ deadline: 1, createdAt: -1 }),
    ),
    withProjectPopulate(Project.find(architectQuery).sort({ deadline: 1, updatedAt: -1 })),
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
    Meeting.find({ participants: req.user._id }).populate("participants", userSelect).sort({ scheduledAt: 1 }),
    SiteVisit.find({ assignedStaff: req.user._id })
      .populate("assignedStaff", userSelect)
      .sort({ date: 1 })
      .limit(10),
  ]);

  const myProjectIds = myProjects.map((project) => project._id);
  const updates = await ProjectUpdate.find({ project: { $in: myProjectIds } })
    .populate("author", userSelect)
    .sort({ createdAt: -1 })
    .limit(15);

  const myMainProjects = myProjects.filter((project) => project.mainArchitect?._id?.toString() === req.user._id.toString());
  const dueSoon = myProjects.filter((project) => project.deadline && new Date(project.deadline) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));
  const overdue = myProjects.filter((project) => project.deadline && new Date(project.deadline) < new Date() && project.status !== "COMPLETED");

  return res.json({
    overview: {
      availableCount: availableWorks.length,
      activeCount: myProjects.filter((project) => ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(project.status)).length,
      reviewCount: myProjects.filter((project) => project.status === "READY_FOR_REVIEW").length,
      overdueCount: overdue.length,
    },
    availableWorks,
    myProjects: myProjects.map((project) => ({
      ...project.toObject(),
      progress: computeProgress(project.status),
    })),
    readyForReview: myProjects.filter((project) => project.status === "READY_FOR_REVIEW"),
    completed: myProjects.filter((project) => project.status === "COMPLETED"),
    dueSoon,
    overdue,
    myMainProjects,
    notifications,
    meetings,
    siteVisits,
    updates,
  });
}

async function getAdminDashboard(req, res) {
  const [projects, architects, users, invites, notifications, meetings, siteVisits, recentActivity] = await Promise.all([
    withProjectPopulate(Project.find().sort({ updatedAt: -1 })),
    User.find({ role: "architect" }).select(userSelect).sort({ fullName: 1 }),
    User.find().select(userSelect).sort({ createdAt: -1 }),
    Invite.find().sort({ createdAt: -1 }).limit(20),
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
    Meeting.find().populate("participants", userSelect).sort({ scheduledAt: 1 }).limit(20),
    SiteVisit.find().populate("assignedStaff", userSelect).sort({ date: 1 }).limit(20),
    AuditLog.find().populate("actor targetUser", userSelect).sort({ createdAt: -1 }).limit(40),
  ]);

  const architectWorkload = architects.map((architect) => {
    const assigned = projects.filter((project) => project.mainArchitect?._id?.toString() === architect._id.toString());
    return {
      architect,
      total: assigned.length,
      active: assigned.filter((project) => ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(project.status)).length,
      review: assigned.filter((project) => project.status === "READY_FOR_REVIEW").length,
      completed: assigned.filter((project) => project.status === "COMPLETED").length,
    };
  });

  const categoryBreakdown = projects.reduce((accumulator, project) => {
    accumulator[project.serviceType] = (accumulator[project.serviceType] || 0) + 1;
    return accumulator;
  }, {});

  return res.json({
    totals: {
      totalProjects: projects.length,
      pendingWorks: projects.filter((project) => project.status === "PENDING").length,
      worksInProgress: projects.filter((project) => ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(project.status)).length,
      reviewQueue: projects.filter((project) => project.status === "READY_FOR_REVIEW").length,
      completed: projects.filter((project) => project.status === "COMPLETED").length,
      architects: architects.length,
      users: users.length,
    },
    reviewQueue: projects.filter((project) => project.status === "READY_FOR_REVIEW"),
    pendingWorks: projects.filter((project) => project.status === "PENDING"),
    inProgress: projects.filter((project) => ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(project.status)),
    completed: projects.filter((project) => project.status === "COMPLETED"),
    projects: projects.map((project) => ({
      ...project.toObject(),
      progress: computeProgress(project.status),
    })),
    architects,
    users,
    invites,
    meetings,
    siteVisits,
    notifications,
    recentActivity,
    architectWorkload,
    categoryBreakdown,
  });
}

module.exports = {
  getClientDashboard,
  getArchitectDashboard,
  getAdminDashboard,
};
