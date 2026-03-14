const multer = require("multer");
const FileAsset = require("../models/FileAsset");
const Project = require("../models/Project");
const { uploadBuffer } = require("../utils/storageService");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 250 * 1024 * 1024,
  },
});

function inferKind(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("model") || mimeType.includes("gltf") || mimeType.includes("glb")) return "model";
  return "other";
}

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "File is required." });
  }

  const uploaded = await uploadBuffer(req.file);
  const fileRecord = await FileAsset.create({
    name: req.file.originalname,
    url: uploaded.url,
    key: uploaded.key,
    kind: req.body.kind || inferKind(req.file.mimetype),
    mimeType: req.file.mimetype,
    size: req.file.size,
    storageProvider: uploaded.storageProvider,
    project: req.body.projectId || undefined,
    uploadedBy: req.user._id,
  });

  if (req.body.projectId) {
    await Project.findByIdAndUpdate(req.body.projectId, {
      $addToSet: { files: fileRecord._id },
    });
  }

  return res.status(201).json(fileRecord);
}

module.exports = {
  upload,
  uploadFile,
};
