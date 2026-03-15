const WorkReport = require("../models/WorkReport");
const User = require("../models/User");
const { createNotifications, logAudit } = require("../utils/activity");

const userSelect = "fullName name username email role avatarUrl avatarSeed isOnline companyArchitectId lastReportAt";

function getReportDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function createWorkReport(req, res) {
  const summary = String(req.body.summary || "").trim();
  const images = Array.isArray(req.body.images)
    ? req.body.images
        .filter((item) => item && typeof item.dataUrl === "string")
        .slice(0, 6)
        .map((item, index) => ({
          name: String(item.name || `report-image-${index + 1}`).slice(0, 120),
          dataUrl: item.dataUrl,
        }))
    : [];

  if (!summary) {
    return res.status(400).json({ message: "Report summary is required." });
  }

  const report = await WorkReport.create({
    architect: req.user._id,
    summary,
    images,
    reportDateKey: getReportDateKey(),
  });

  req.user.lastReportAt = report.createdAt;
  await req.user.save();

  const adminUsers = await User.find({ role: "admin", isActive: true }).select("_id role");

  await logAudit({
    action: "WORK_REPORT_SUBMITTED",
    actor: req.user._id,
    targetUser: req.user._id,
    metadata: { reportId: report._id },
  });

  await createNotifications(
    adminUsers.map((user) => ({
      user: user._id,
      type: "WORK_REPORT_SUBMITTED",
      title: "Architect report submitted",
      message: `${req.user.username || req.user.fullName} submitted today\u2019s report.`,
      actionUrl: "/admin/workload",
    })),
  );

  const populatedReport = await WorkReport.findById(report._id).populate("architect", userSelect);
  return res.status(201).json(populatedReport);
}

async function listMyReports(req, res) {
  const reports = await WorkReport.find({ architect: req.user._id })
    .populate("architect", userSelect)
    .sort({ createdAt: -1 });

  return res.json(reports);
}

async function listReportsByArchitect(req, res) {
  const reports = await WorkReport.find()
    .populate("architect", userSelect)
    .sort({ createdAt: -1 });

  const grouped = [];
  const reportMap = new Map();

  for (const report of reports) {
    if (!report.architect) {
      continue;
    }

    const architectId = report.architect._id.toString();

    if (!reportMap.has(architectId)) {
      reportMap.set(architectId, {
        architect: report.architect,
        reports: [],
      });
      grouped.push(reportMap.get(architectId));
    }

    reportMap.get(architectId).reports.push(report);
  }

  return res.json(grouped);
}

async function getReportStatus(req, res) {
  const cutoff = req.user.lastLoginAt ? new Date(req.user.lastLoginAt) : new Date(0);
  const sessionReport = await WorkReport.findOne({
    architect: req.user._id,
    createdAt: { $gte: cutoff },
  }).sort({ createdAt: -1 });

  return res.json({
    hasReportedForSession: Boolean(sessionReport),
    lastReportAt: sessionReport?.createdAt || req.user.lastReportAt || null,
  });
}

module.exports = {
  createWorkReport,
  listMyReports,
  listReportsByArchitect,
  getReportStatus,
};
