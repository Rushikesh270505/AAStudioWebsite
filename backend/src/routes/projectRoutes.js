const express = require("express");
const {
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
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", listProjects);
router.get("/slug/:slug", getProjectBySlug);
router.get("/:id", protect, getProject);
router.post("/", protect, authorize("architect", "admin"), createProject);
router.patch("/:id/status", protect, authorize("architect", "admin"), updateProjectStatus);
router.patch("/:id/assign", protect, authorize("admin"), assignProjectClient);
router.post("/:id/claim", protect, authorize("architect"), claimProject);
router.post("/:id/collaborators", protect, authorize("architect", "admin"), addCollaborators);
router.delete("/:id/collaborators/:architectId", protect, authorize("architect", "admin"), removeCollaborator);
router.get("/:id/updates", protect, listProjectUpdates);
router.post("/:id/updates", protect, createProjectUpdate);
router.post("/:id/submit-review", protect, authorize("architect", "admin"), submitProjectForReview);
router.post("/:id/review", protect, authorize("admin"), reviewProject);

module.exports = router;
