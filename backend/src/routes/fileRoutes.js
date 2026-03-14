const express = require("express");
const { upload, uploadFile } = require("../controllers/fileController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/upload",
  protect,
  authorize("architect", "admin"),
  upload.single("file"),
  uploadFile,
);

module.exports = router;
