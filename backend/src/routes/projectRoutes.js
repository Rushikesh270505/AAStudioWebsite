const express = require("express");
const {
  listProjects,
  getProject,
  getProjectBySlug,
  createProject,
  updateProjectStatus,
  assignProjectClient,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", listProjects);
router.get("/slug/:slug", getProjectBySlug);
router.get("/:id", getProject);
router.post("/", protect, authorize("architect", "admin"), createProject);
router.patch("/:id/status", protect, authorize("architect", "admin"), updateProjectStatus);
router.patch("/:id/assign", protect, authorize("architect", "admin"), assignProjectClient);

module.exports = router;
