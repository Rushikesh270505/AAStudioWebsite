const express = require("express");
const {
  listArchitects,
  listUsers,
  updateProfile,
  createArchitect,
  archiveArchitect,
  terminateArchitect,
  updateUserStatus,
  createInvite,
  listInvites,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/architects", protect, authorize("architect", "admin"), listArchitects);
router.patch("/profile", protect, updateProfile);
router.get("/", protect, authorize("admin"), listUsers);
router.post("/architects", protect, authorize("admin"), createArchitect);
router.post("/architects/:id/archive", protect, authorize("admin"), archiveArchitect);
router.delete("/architects/:id/terminate", protect, authorize("admin"), terminateArchitect);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.get("/invites", protect, authorize("admin"), listInvites);
router.post("/invites", protect, authorize("admin"), createInvite);

module.exports = router;
