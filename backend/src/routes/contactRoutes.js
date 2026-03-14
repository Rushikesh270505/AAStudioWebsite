const express = require("express");
const { createLead, listLeads } = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", createLead);
router.get("/", protect, authorize("admin"), listLeads);

module.exports = router;
