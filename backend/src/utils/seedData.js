const crypto = require("crypto");

function getSeedValue(key, fallback) {
  const value = process.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getSeedPassword(key) {
  const configured = process.env[key];

  if (typeof configured === "string" && configured.trim()) {
    return configured.trim();
  }

  return crypto.randomBytes(12).toString("base64url");
}

const seedCredentials = [
  {
    role: "Architect",
    email: getSeedValue("SEED_ARCHITECT_EMAIL", "architect.demo@example.com"),
    password: getSeedPassword("SEED_ARCHITECT_PASSWORD"),
  },
  {
    role: "Client",
    email: getSeedValue("SEED_CLIENT_EMAIL", "client.demo@example.com"),
    password: getSeedPassword("SEED_CLIENT_PASSWORD"),
  },
  {
    role: "Admin",
    email: getSeedValue("SEED_ADMIN_EMAIL", "admin.demo@example.com"),
    password: getSeedPassword("SEED_ADMIN_PASSWORD"),
  },
];

const users = [
  {
    name: "Aarav Mehta",
    email: seedCredentials[0].email,
    password: seedCredentials[0].password,
    role: "architect",
    studioName: "Art and Architecture Studios",
  },
  {
    name: "Mira Kapoor",
    email: seedCredentials[1].email,
    password: seedCredentials[1].password,
    role: "client",
  },
  {
    name: "Platform Admin",
    email: seedCredentials[2].email,
    password: seedCredentials[2].password,
    role: "admin",
  },
];

const projects = [
  {
    title: "Horizon Residence",
    slug: "horizon-residence",
    location: "North Goa, India",
    projectType: "Coastal Private Villa",
    summary:
      "A layered waterfront residence composed around sea-facing courts, shaded colonnades, and a double-height living gallery.",
    status: "Completed",
    area: "8,400 sq ft",
    year: "2025",
    duration: "16 months",
    coordinates: { lat: 15.2993, lng: 74.124 },
    heroImage:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
    walkthroughUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-modern-house-11119-large.mp4",
    timeline: [
      {
        title: "Concept approval",
        status: "Approved",
        date: "Feb 06, 2024",
        note: "Climate and view studies locked with the client team.",
      },
    ],
  },
  {
    title: "Atelier Courtyard",
    slug: "atelier-courtyard",
    location: "Bengaluru, India",
    projectType: "Creative Campus",
    summary:
      "A studio campus designed as a shaded courtyard network with gallery workshops and flexible collaboration pods.",
    status: "In Construction",
    area: "12,200 sq ft",
    year: "2026",
    duration: "18 months",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    heroImage:
      "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1600&q=80",
    walkthroughUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-modern-house-exterior-architecture-51435-large.mp4",
    timeline: [
      {
        title: "Site mobilization",
        status: "Active",
        date: "Mar 03, 2026",
        note: "Civil package and structural coordination underway.",
      },
    ],
  },
];

module.exports = {
  users,
  projects,
  seedCredentials,
};
