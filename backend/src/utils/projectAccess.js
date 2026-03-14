const Project = require("../models/Project");
const ProjectCollaborator = require("../models/ProjectCollaborator");

async function getProjectAccessSnapshot(projectId, user) {
  const project = await Project.findById(projectId)
    .populate("client", "fullName name username email role avatarUrl avatarSeed")
    .populate("mainArchitect", "fullName name username email role avatarUrl avatarSeed companyArchitectId")
    .populate("architect", "fullName name username email role avatarUrl avatarSeed companyArchitectId")
    .populate("createdByAdmin", "fullName name username email role avatarUrl avatarSeed")
    .populate("files");

  if (!project) {
    return null;
  }

  const collaborators = await ProjectCollaborator.find({ project: project._id }).populate(
    "architect addedBy",
    "fullName name username email role avatarUrl avatarSeed companyArchitectId",
  );

  const collaboratorIds = collaborators.map((item) => item.architect?._id?.toString()).filter(Boolean);

  const isAdmin = user.role === "admin";
  const isMainArchitect = Boolean(project.mainArchitect && project.mainArchitect._id.toString() === user._id.toString());
  const isCollaborator = collaboratorIds.includes(user._id.toString());
  const isClient = Boolean(project.client && project.client._id.toString() === user._id.toString());
  const canAccess = isAdmin || isMainArchitect || isCollaborator || isClient;

  return {
    project,
    collaborators,
    canAccess,
    isAdmin,
    isMainArchitect,
    isCollaborator,
    isClient,
  };
}

module.exports = {
  getProjectAccessSnapshot,
};
