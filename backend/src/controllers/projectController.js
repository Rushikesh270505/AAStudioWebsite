const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const ProjectCollaborator = require("../models/ProjectCollaborator");
const ProjectUpdate = require("../models/ProjectUpdate");
const Meeting = require("../models/Meeting");
const SiteVisit = require("../models/SiteVisit");
const Invoice = require("../models/Invoice");
const AuditLog = require("../models/AuditLog");
const {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SERVICE_TYPES,
} = require("../utils/constants");
const { createNotifications, logAudit } = require("../utils/activity");
const { getProjectAccessSnapshot } = require("../utils/projectAccess");

const userSelect =
  "fullName name email role avatarUrl avatarSeed companyArchitectId specializationTags studioName";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateProjectCode(serviceType) {
  const servicePrefix = (serviceType || "PR").replace(/[^A-Z]/gi, "").slice(0, 3).toUpperCase() || "PRJ";
  const count = await Project.countDocuments();
  return `${servicePrefix}-${String(count + 1).padStart(4, "0")}`;
}

function withProjectPopulate(query) {
  return query
    .populate("client", userSelect)
    .populate("mainArchitect", userSelect)
    .populate("architect", userSelect)
    .populate("createdByAdmin", userSelect)
    .populate("files");
}

async function fetchProjectBundle(projectId) {
  const project = await withProjectPopulate(Project.findById(projectId));

  if (!project) {
    return null;
  }

  const [collaborators, updates, meetings, siteVisits, invoices, auditLog] = await Promise.all([
    ProjectCollaborator.find({ project: project._id })
      .populate("architect", userSelect)
      .populate("addedBy", userSelect)
      .sort({ addedAt: 1 }),
    ProjectUpdate.find({ project: project._id })
      .populate("author", userSelect)
      .populate("mentions", userSelect)
      .sort({ createdAt: -1 })
      .limit(50),
    Meeting.find({ project: project._id }).populate("participants", userSelect).sort({ scheduledAt: 1 }),
    SiteVisit.find({ project: project._id }).populate("assignedStaff", userSelect).sort({ date: 1 }),
    Invoice.find({ project: project._id }).sort({ dueDate: 1 }),
    AuditLog.find({ project: project._id }).populate("actor targetUser", userSelect).sort({ createdAt: -1 }).limit(40),
  ]);

  return {
    project,
    collaborators,
    updates,
    meetings,
    siteVisits,
    invoices,
    auditLog,
  };
}

function buildSearchQuery(search) {
  if (!search) {
    return {};
  }

  const regex = new RegExp(search.trim(), "i");
  return {
    $or: [
      { title: regex },
      { projectCode: regex },
      { location: regex },
      { summary: regex },
      { category: regex },
      { serviceType: regex },
    ],
  };
}

async function loadCollaboratorIds(projectId) {
  const collaborators = await ProjectCollaborator.find({ project: projectId }).select("architect");
  return collaborators.map((item) => item.architect.toString());
}

async function collectStakeholderIds(project, excludeIds = []) {
  const collaboratorIds = await loadCollaboratorIds(project._id);
  const participantIds = [
    project.client?.toString?.() || project.client?._id?.toString?.(),
    project.mainArchitect?.toString?.() || project.mainArchitect?._id?.toString?.(),
    project.createdByAdmin?.toString?.() || project.createdByAdmin?._id?.toString?.(),
    ...collaboratorIds,
  ].filter(Boolean);

  return [...new Set(participantIds)].filter((id) => !excludeIds.includes(id));
}

function computeClientVisibleProgress(status) {
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

async function listProjects(req, res) {
  const query = {
    ...buildSearchQuery(req.query.search),
  };

  if (req.query.status && PROJECT_STATUSES.includes(req.query.status)) {
    query.status = req.query.status;
  }

  if (req.query.serviceType && SERVICE_TYPES.includes(req.query.serviceType)) {
    query.serviceType = req.query.serviceType;
  }

  if (req.query.priority && PROJECT_PRIORITIES.includes(req.query.priority)) {
    query.priority = req.query.priority;
  }

  const projects = await withProjectPopulate(Project.find(query).sort({ createdAt: -1 }));
  return res.json(
    projects.map((project) => ({
      ...project.toObject(),
      progress: computeClientVisibleProgress(project.status),
    })),
  );
}

async function getProject(req, res) {
  const access = await getProjectAccessSnapshot(req.params.id, req.user);

  if (!access) {
    return res.status(404).json({ message: "Project not found." });
  }

  if (!access.canAccess) {
    return res.status(403).json({ message: "You do not have access to this project." });
  }

  const bundle = await fetchProjectBundle(req.params.id);
  return res.json(bundle);
}

async function getProjectBySlug(req, res) {
  const project = await withProjectPopulate(Project.findOne({ slug: req.params.slug }));

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  const [collaborators, updates] = await Promise.all([
    ProjectCollaborator.find({ project: project._id })
      .populate("architect", userSelect)
      .populate("addedBy", userSelect)
      .sort({ addedAt: 1 }),
    ProjectUpdate.find({ project: project._id })
      .populate("author", userSelect)
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  return res.json({
    project: {
      ...project.toObject(),
      progress: computeClientVisibleProgress(project.status),
    },
    collaborators,
    updates,
  });
}

async function createProject(req, res) {
  const {
    title,
    location,
    projectType,
    summary,
    description,
    status,
    heroImage,
    gallery,
    year,
    area,
    duration,
    coordinates,
    clientId,
    mainArchitectId,
    category,
    serviceType,
    priority,
    deadline,
    modelUrl,
    walkthroughUrl,
    quotation,
    paymentMilestones,
    tags,
  } = req.body;

  const slugBase = slugify(title);
  const slugExists = await Project.findOne({ slug: slugBase });
  const slug = slugExists ? `${slugBase}-${Date.now()}` : slugBase;
  const projectCode = await generateProjectCode(serviceType || category);
  const initialStatus = PROJECT_STATUSES.includes(status) ? status : mainArchitectId ? "IN_PROGRESS" : "PENDING";

  const project = await Project.create({
    projectCode,
    title,
    slug,
    location,
    projectType,
    category: category || serviceType || "Planning Residential",
    serviceType: serviceType || category || "Planning Residential",
    priority: PROJECT_PRIORITIES.includes(priority) ? priority : "MEDIUM",
    deadline: deadline || undefined,
    summary,
    description: description || summary,
    status: initialStatus,
    heroImage,
    gallery: Array.isArray(gallery) ? gallery : [],
    year,
    area,
    duration,
    coordinates,
    modelUrl,
    walkthroughUrl,
    quotation,
    paymentMilestones: Array.isArray(paymentMilestones) ? paymentMilestones : [],
    architect: mainArchitectId || undefined,
    mainArchitect: mainArchitectId || undefined,
    client: clientId || undefined,
    createdByAdmin: req.user.role === "admin" ? req.user._id : undefined,
    tags: Array.isArray(tags) ? tags : [],
    latestReportAt: initialStatus === "IN_PROGRESS" ? new Date() : undefined,
  });

  if (clientId) {
    await User.findByIdAndUpdate(clientId, { $addToSet: { assignedProjects: project._id } });
  }

  if (mainArchitectId) {
    await User.findByIdAndUpdate(mainArchitectId, { $addToSet: { assignedProjects: project._id } });
  }

  await logAudit({
    action: "PROJECT_CREATED",
    actor: req.user._id,
    project: project._id,
    metadata: { projectCode: project.projectCode, title: project.title },
  });

  const notifyIds = await collectStakeholderIds(project, [req.user._id.toString()]);
  await createNotifications(
    notifyIds.map((userId) => ({
      user: userId,
      type: "PROJECT_ASSIGNED",
      title: "New project created",
      message: `${project.title} has been added to the studio pipeline.`,
      relatedProject: project._id,
      actionUrl: `/admin/projects/${project._id}`,
    })),
  );

  return res.status(201).json(await fetchProjectBundle(project._id));
}

async function updateProjectStatus(req, res) {
  const { status } = req.body;

  if (!PROJECT_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid project status." });
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  project.status = status;
  if (status === "READY_FOR_REVIEW") {
    project.readyForReviewAt = new Date();
  }
  if (status === "COMPLETED") {
    project.completedAt = new Date();
  }
  await project.save();

  await logAudit({
    action: "PROJECT_STATUS_UPDATED",
    actor: req.user._id,
    project: project._id,
    metadata: { status },
  });

  return res.json(await fetchProjectBundle(project._id));
}

async function assignProjectClient(req, res) {
  const { clientId } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  project.client = clientId;
  await project.save();

  await User.findByIdAndUpdate(clientId, { $addToSet: { assignedProjects: project._id } });
  await logAudit({
    action: "PROJECT_CLIENT_ASSIGNED",
    actor: req.user._id,
    project: project._id,
    targetUser: clientId,
  });

  await createNotifications([
    {
      user: clientId,
      type: "PROJECT_ASSIGNED",
      title: "You have been assigned to a project",
      message: `${project.title} is now available in your client dashboard.`,
      relatedProject: project._id,
      actionUrl: `/client/projects/${project._id}`,
    },
  ]);

  return res.json(await fetchProjectBundle(project._id));
}

async function claimProject(req, res) {
  const session = await mongoose.startSession();
  let claimedProjectId;

  try {
    await session.withTransaction(async () => {
      const project = await Project.findOne({
        _id: req.params.id,
        status: "PENDING",
        $or: [{ mainArchitect: null }, { mainArchitect: { $exists: false } }],
      }).session(session);

      if (!project) {
        throw new Error("This project is no longer available to claim.");
      }

      project.mainArchitect = req.user._id;
      project.architect = req.user._id;
      project.status = "IN_PROGRESS";
      project.latestReportAt = new Date();
      await project.save({ session });

      await User.findByIdAndUpdate(
        req.user._id,
        {
          $addToSet: { assignedProjects: project._id },
        },
        { session },
      );

      claimedProjectId = project._id;
      await AuditLog.create(
        [
          {
            action: "PROJECT_CLAIMED",
            actor: req.user._id,
            project: project._id,
            metadata: { projectCode: project.projectCode },
          },
        ],
        { session },
      );
    });
  } catch (error) {
    await session.endSession();
    return res.status(409).json({ message: error.message || "Unable to claim project." });
  }

  await session.endSession();

  const project = await Project.findById(claimedProjectId);
  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  await createNotifications(
    admins.map((admin) => ({
      user: admin._id,
      type: "PROJECT_CLAIMED",
      title: "Project claimed",
      message: `${project.title} was claimed by ${req.user.fullName || req.user.name}.`,
      relatedProject: project._id,
      actionUrl: `/admin/projects/${project._id}`,
    })),
  );

  return res.json(await fetchProjectBundle(claimedProjectId));
}

async function addCollaborators(req, res) {
  const { architectIds = [] } = req.body;
  const access = await getProjectAccessSnapshot(req.params.id, req.user);

  if (!access) {
    return res.status(404).json({ message: "Project not found." });
  }

  if (!(access.isAdmin || access.isMainArchitect)) {
    return res.status(403).json({ message: "Only the main architect or admin can add collaborators." });
  }

  const distinctIds = [...new Set(architectIds)].filter(
    (architectId) => architectId && architectId !== access.project.mainArchitect?._id?.toString(),
  );

  const created = await Promise.all(
    distinctIds.map(async (architectId) => {
      const collaborator = await ProjectCollaborator.findOneAndUpdate(
        {
          project: access.project._id,
          architect: architectId,
        },
        {
          $setOnInsert: {
            addedBy: req.user._id,
            addedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      await User.findByIdAndUpdate(architectId, { $addToSet: { assignedProjects: access.project._id } });
      await logAudit({
        action: "COLLABORATOR_ADDED",
        actor: req.user._id,
        project: access.project._id,
        targetUser: architectId,
      });

      return collaborator;
    }),
  );

  await createNotifications(
    distinctIds.map((architectId) => ({
      user: architectId,
      type: "COLLABORATOR_ADDED",
      title: "You were added as a collaborator",
      message: `You have been added to ${access.project.title}.`,
      relatedProject: access.project._id,
      actionUrl: `/architect/projects/${access.project._id}`,
    })),
  );

  return res.status(201).json({
    createdCount: created.length,
    project: await fetchProjectBundle(access.project._id),
  });
}

async function removeCollaborator(req, res) {
  const access = await getProjectAccessSnapshot(req.params.id, req.user);

  if (!access) {
    return res.status(404).json({ message: "Project not found." });
  }

  if (!(access.isAdmin || access.isMainArchitect)) {
    return res.status(403).json({ message: "Only the main architect or admin can remove collaborators." });
  }

  await ProjectCollaborator.findOneAndDelete({
    project: access.project._id,
    architect: req.params.architectId,
  });

  await logAudit({
    action: "COLLABORATOR_REMOVED",
    actor: req.user._id,
    project: access.project._id,
    targetUser: req.params.architectId,
  });

  return res.json(await fetchProjectBundle(access.project._id));
}

async function listProjectUpdates(req, res) {
  const access = await getProjectAccessSnapshot(req.params.id, req.user);

  if (!access) {
    return res.status(404).json({ message: "Project not found." });
  }

  if (!access.canAccess) {
    return res.status(403).json({ message: "You do not have access to this project." });
  }

  const updates = await ProjectUpdate.find({ project: access.project._id })
    .populate("author", userSelect)
    .populate("mentions", userSelect)
    .sort({ createdAt: -1 });

  return res.json(updates);
}

async function createProjectUpdate(req, res) {
  const access = await getProjectAccessSnapshot(req.params.id, req.user);

  if (!access) {
    return res.status(404).json({ message: "Project not found." });
  }

  if (!access.canAccess) {
    return res.status(403).json({ message: "You do not have access to this project." });
  }

  const {
    updateType = req.user.role === "client" ? "REVISION_REQUEST" : "PROGRESS_UPDATE",
    message,
    attachmentUrl,
    attachmentName,
    tag,
    parentUpdate,
    mentions = [],
  } = req.body;

  const update = await ProjectUpdate.create({
    project: access.project._id,
    author: req.user._id,
    updateType,
    message,
    attachmentUrl,
    attachmentName,
    tag,
    parentUpdate,
    mentions,
  });

  access.project.latestReportAt = new Date();
  if (access.project.status === "PENDING" && req.user.role !== "client") {
    access.project.status = "IN_PROGRESS";
  }
  if (updateType === "REVISION_REQUEST") {
    access.project.status = "CHANGES_REQUESTED";
  }
  await access.project.save();

  await logAudit({
    action: "PROJECT_UPDATE_CREATED",
    actor: req.user._id,
    project: access.project._id,
    metadata: { updateType },
  });

  const notifyIds = await collectStakeholderIds(access.project, [req.user._id.toString()]);
  await createNotifications(
    notifyIds.map((userId) => ({
      user: userId,
      type: "PROJECT_UPDATE",
      title: "New project update",
      message: `${req.user.fullName || req.user.name} posted a ${updateType.toLowerCase().replace(/_/g, " ")} on ${access.project.title}.`,
      relatedProject: access.project._id,
      actionUrl:
        req.user.role === "admin"
          ? `/admin/projects/${access.project._id}`
          : req.user.role === "client"
            ? `/client/projects/${access.project._id}`
            : `/architect/projects/${access.project._id}`,
    })),
  );

  return res.status(201).json(await update.populate("author mentions", userSelect));
}

async function submitProjectForReview(req, res) {
  const access = await getProjectAccessSnapshot(req.params.id, req.user);

  if (!access) {
    return res.status(404).json({ message: "Project not found." });
  }

  if (!(access.isAdmin || access.isMainArchitect)) {
    return res.status(403).json({ message: "Only the main architect or admin can submit for review." });
  }

  access.project.status = "READY_FOR_REVIEW";
  access.project.readyForReviewAt = new Date();
  access.project.reviewRequestedBy = req.user._id;
  await access.project.save();

  await ProjectUpdate.create({
    project: access.project._id,
    author: req.user._id,
    updateType: "SYSTEM",
    message: req.body.message || "Project marked as ready for review.",
    tag: "Review",
  });

  await logAudit({
    action: "PROJECT_SUBMITTED_FOR_REVIEW",
    actor: req.user._id,
    project: access.project._id,
  });

  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  await createNotifications(
    admins.map((admin) => ({
      user: admin._id,
      type: "REVIEW_SUBMITTED",
      title: "Project ready for review",
      message: `${access.project.title} has been submitted for review.`,
      relatedProject: access.project._id,
      actionUrl: `/admin/review`,
    })),
  );

  return res.json(await fetchProjectBundle(access.project._id));
}

async function reviewProject(req, res) {
  const { action, comment } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  if (action === "approve") {
    project.status = "COMPLETED";
    project.completedAt = new Date();
  } else if (action === "changes") {
    project.status = "CHANGES_REQUESTED";
    project.readyForReviewAt = undefined;
  } else {
    return res.status(400).json({ message: "Review action must be approve or changes." });
  }

  await project.save();

  await ProjectUpdate.create({
    project: project._id,
    author: req.user._id,
    updateType: "REVIEW_COMMENT",
    message:
      comment ||
      (action === "approve"
        ? "Admin approved the deliverables and marked the project completed."
        : "Admin requested changes before final approval."),
    tag: action === "approve" ? "Approved" : "Changes requested",
  });

  await logAudit({
    action: action === "approve" ? "PROJECT_APPROVED" : "PROJECT_CHANGES_REQUESTED",
    actor: req.user._id,
    project: project._id,
    metadata: { comment },
  });

  const notifyIds = await collectStakeholderIds(project, [req.user._id.toString()]);
  await createNotifications(
    notifyIds.map((userId) => ({
      user: userId,
      type: action === "approve" ? "PROJECT_COMPLETED" : "CHANGES_REQUESTED",
      title: action === "approve" ? "Project approved" : "Changes requested",
      message:
        action === "approve"
          ? `${project.title} has been approved and marked completed.`
          : `${project.title} has been sent back with change requests.`,
      relatedProject: project._id,
      actionUrl: action === "approve" ? `/client/projects/${project._id}` : `/architect/projects/${project._id}`,
    })),
  );

  return res.json(await fetchProjectBundle(project._id));
}

module.exports = {
  listProjects,
  getProject,
  getProjectBySlug,
  createProject,
  updateProjectStatus,
  assignProjectClient,
  claimProject,
  addCollaborators,
  removeCollaborator,
  listProjectUpdates,
  createProjectUpdate,
  submitProjectForReview,
  reviewProject,
};
