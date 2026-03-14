const SiteVisit = require("../models/SiteVisit");
const { createNotifications, logAudit } = require("../utils/activity");

async function listSiteVisits(req, res) {
  const query = {};

  if (req.query.projectId) {
    query.project = req.query.projectId;
  }

  if (req.user.role === "architect") {
    query.assignedStaff = req.user._id;
  }

  const visits = await SiteVisit.find(query)
    .populate("assignedStaff", "fullName name username email role avatarUrl avatarSeed")
    .sort({ date: 1 });

  return res.json(visits);
}

async function createSiteVisit(req, res) {
  const visit = await SiteVisit.create(req.body);

  await logAudit({
    action: "SITE_VISIT_CREATED",
    actor: req.user._id,
    project: visit.project,
    metadata: { location: visit.location },
  });

  await createNotifications(
    (visit.assignedStaff || []).map((staffId) => ({
      user: staffId,
      type: "SITE_VISIT_SCHEDULED",
      title: "Site visit scheduled",
      message: `A site visit has been scheduled for ${visit.location}.`,
      relatedProject: visit.project,
      actionUrl: `/admin/site-visits`,
    })),
  );

  return res.status(201).json(
    await SiteVisit.findById(visit._id).populate("assignedStaff", "fullName name username email role avatarUrl avatarSeed"),
  );
}

module.exports = {
  listSiteVisits,
  createSiteVisit,
};
