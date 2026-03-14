const express = require("express");
const { listMeetings, createMeeting } = require("../controllers/meetingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("client", "architect", "admin"), listMeetings);
router.post("/", protect, authorize("architect", "admin"), createMeeting);

module.exports = router;
