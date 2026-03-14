const express = require("express");
const {
  getClientDashboard,
  getArchitectDashboard,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/client", protect, authorize("client", "architect", "admin"), getClientDashboard);
router.get("/architect", protect, authorize("architect", "admin"), getArchitectDashboard);

module.exports = router;
