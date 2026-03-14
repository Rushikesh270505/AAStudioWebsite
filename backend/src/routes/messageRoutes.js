const express = require("express");
const { listMessages, createMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, listMessages);
router.post("/", protect, createMessage);

module.exports = router;
