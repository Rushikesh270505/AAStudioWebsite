const express = require("express");
const {
  getClientDashboard,
  getArchitectDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/client", protect, authorize("public_user", "client", "architect", "admin"), getClientDashboard);
router.get("/architect", protect, authorize("architect", "admin"), getArchitectDashboard);
router.get("/admin", protect, authorize("admin"), getAdminDashboard);

module.exports = router;
