const express = require("express");
const { listSiteVisits, createSiteVisit } = require("../controllers/siteVisitController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("architect", "admin"), listSiteVisits);
router.post("/", protect, authorize("admin"), createSiteVisit);

module.exports = router;
