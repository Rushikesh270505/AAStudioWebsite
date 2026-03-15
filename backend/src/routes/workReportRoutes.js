const express = require("express");
const {
  createWorkReport,
  listMyReports,
  listReportsByArchitect,
  getReportStatus,
} = require("../controllers/workReportController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/my", protect, authorize("architect"), listMyReports);
router.get("/status", protect, authorize("architect"), getReportStatus);
router.get("/architects", protect, authorize("admin"), listReportsByArchitect);
router.post("/", protect, authorize("architect"), createWorkReport);

module.exports = router;
