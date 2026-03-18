const USER_ROLES = ["public_user", "client", "architect", "admin"];
const PROJECT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "READY_FOR_REVIEW",
  "CHANGES_REQUESTED",
  "COMPLETED",
];
const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SERVICE_TYPES = [
  "Walkthrough",
  "3D Renders",
  "Interior Design",
  "Exterior Design",
  "Furniture Design",
  "Planning Commercial",
  "Planning Residential",
  "Elevation Design",
  "Walkthrough Editing",
  "Cost and Estimation",
  "Architectural Planning",
  "Exterior Elevation Design",
  "Landscape Design",
  "Architectural Art & Decorative Design",
  "3D Architectural Modeling",
  "Walkthrough & Architectural Visualization",
  "Architectural Media Editing",
];
const UPDATE_TYPES = [
  "DAILY_REPORT",
  "BLOCKER",
  "REVISION_REQUEST",
  "PROGRESS_UPDATE",
  "FILE_NOTE",
  "REVIEW_COMMENT",
  "SYSTEM",
];
const MEETING_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"];
const SITE_VISIT_STATUSES = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const NOTIFICATION_TYPES = [
  "PROJECT_ASSIGNED",
  "COLLABORATOR_ADDED",
  "REVIEW_SUBMITTED",
  "CHANGES_REQUESTED",
  "PROJECT_COMPLETED",
  "MEETING_CREATED",
  "SITE_VISIT_SCHEDULED",
  "PROJECT_CLAIMED",
  "PROJECT_UPDATE",
  "LEAD_CAPTURED",
  "INVITE_CREATED",
  "WORK_REPORT_SUBMITTED",
];

module.exports = {
  USER_ROLES,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  SERVICE_TYPES,
  UPDATE_TYPES,
  MEETING_STATUSES,
  SITE_VISIT_STATUSES,
  NOTIFICATION_TYPES,
};
