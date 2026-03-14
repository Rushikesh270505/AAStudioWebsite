const Project = require("../models/Project");
const User = require("../models/User");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function listProjects(req, res) {
  const projects = await Project.find()
    .populate("client", "name email")
    .populate("architect", "name email")
    .populate("files")
    .sort({ createdAt: -1 });

  return res.json(projects);
}

async function getProject(req, res) {
  const project = await Project.findById(req.params.id)
    .populate("client", "name email")
    .populate("architect", "name email")
    .populate("files");

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  return res.json(project);
}

async function getProjectBySlug(req, res) {
  const project = await Project.findOne({ slug: req.params.slug })
    .populate("client", "name email")
    .populate("architect", "name email")
    .populate("files");

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  return res.json(project);
}

async function createProject(req, res) {
  const {
    title,
    location,
    projectType,
    summary,
    status,
    heroImage,
    year,
    area,
    duration,
    coordinates,
    clientId,
  } = req.body;

  const slugBase = slugify(title);
  const slugExists = await Project.findOne({ slug: slugBase });
  const slug = slugExists ? `${slugBase}-${Date.now()}` : slugBase;

  const project = await Project.create({
    title,
    slug,
    location,
    projectType,
    summary,
    status,
    heroImage,
    year,
    area,
    duration,
    coordinates,
    architect: req.user._id,
    client: clientId || undefined,
  });

  if (clientId) {
    await User.findByIdAndUpdate(clientId, { $addToSet: { assignedProjects: project._id } });
  }

  return res.status(201).json(project);
}

async function updateProjectStatus(req, res) {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: req.body.status,
      },
    },
    { new: true },
  );

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  return res.json(project);
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

  return res.json(project);
}

module.exports = {
  listProjects,
  getProject,
  getProjectBySlug,
  createProject,
  updateProjectStatus,
  assignProjectClient,
};
