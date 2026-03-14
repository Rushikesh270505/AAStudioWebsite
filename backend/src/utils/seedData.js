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
    role: "Admin",
    email: getSeedValue("SEED_ADMIN_EMAIL", "admin.demo@example.com"),
    password: getSeedPassword("SEED_ADMIN_PASSWORD"),
  },
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
    role: "Public User",
    email: getSeedValue("SEED_PUBLIC_EMAIL", "guest.demo@example.com"),
    password: getSeedPassword("SEED_PUBLIC_PASSWORD"),
  },
];

const users = [
  {
    fullName: "Platform Admin",
    name: "Platform Admin",
    email: seedCredentials[0].email,
    password: seedCredentials[0].password,
    role: "admin",
    studioName: "Art and Architecture Studios",
  },
  {
    fullName: "Aarav Mehta",
    name: "Aarav Mehta",
    email: seedCredentials[1].email,
    password: seedCredentials[1].password,
    role: "architect",
    companyArchitectId: "ARCH-1001",
    specializationTags: ["Walkthrough", "3D Renders", "Exterior Design"],
    studioName: "Art and Architecture Studios",
  },
  {
    fullName: "Nisha Rao",
    name: "Nisha Rao",
    email: "nisha.rao@example.com",
    password: getSeedPassword("SEED_ARCHITECT_PASSWORD_2"),
    role: "architect",
    companyArchitectId: "ARCH-1002",
    specializationTags: ["Interior Design", "Furniture Design"],
  },
  {
    fullName: "Kabir Shah",
    name: "Kabir Shah",
    email: "kabir.shah@example.com",
    password: getSeedPassword("SEED_ARCHITECT_PASSWORD_3"),
    role: "architect",
    companyArchitectId: "ARCH-1003",
    specializationTags: ["Planning Commercial", "Elevation Design"],
  },
  {
    fullName: "Tara Iyer",
    name: "Tara Iyer",
    email: "tara.iyer@example.com",
    password: getSeedPassword("SEED_ARCHITECT_PASSWORD_4"),
    role: "architect",
    companyArchitectId: "ARCH-1004",
    specializationTags: ["Walkthrough Editing", "Cost and Estimation"],
  },
  {
    fullName: "Rohan Bedi",
    name: "Rohan Bedi",
    email: "rohan.bedi@example.com",
    password: getSeedPassword("SEED_ARCHITECT_PASSWORD_5"),
    role: "architect",
    companyArchitectId: "ARCH-1005",
    specializationTags: ["Planning Residential", "3D Renders"],
  },
  {
    fullName: "Mira Kapoor",
    name: "Mira Kapoor",
    email: seedCredentials[2].email,
    password: seedCredentials[2].password,
    role: "client",
    phone: "+91 98765 11111",
  },
  {
    fullName: "Ishaan Patel",
    name: "Ishaan Patel",
    email: "ishaan.client@example.com",
    password: getSeedPassword("SEED_CLIENT_PASSWORD_2"),
    role: "client",
    phone: "+91 98765 22222",
  },
  {
    fullName: "Sana Dsouza",
    name: "Sana Dsouza",
    email: "sana.client@example.com",
    password: getSeedPassword("SEED_CLIENT_PASSWORD_3"),
    role: "client",
    phone: "+91 98765 33333",
  },
  {
    fullName: "Guest Onboarding",
    name: "Guest Onboarding",
    email: seedCredentials[3].email,
    password: seedCredentials[3].password,
    role: "public_user",
  },
];

const imageSets = [
  {
    hero:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    hero:
      "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    hero:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1600&q=80",
    ],
  },
];

const serviceCatalog = [
  {
    title: "Horizon Residence",
    location: "North Goa, India",
    projectType: "Coastal Private Villa",
    serviceType: "Planning Residential",
    category: "Planning Residential",
    status: "COMPLETED",
    priority: "MEDIUM",
    area: "8,400 sq ft",
    year: "2025",
    duration: "16 months",
    coordinates: { lat: 15.2993, lng: 74.124 },
    summary:
      "A layered waterfront residence composed around sea-facing courts, shaded colonnades, and a double-height living gallery.",
  },
  {
    title: "Atelier Courtyard",
    location: "Bengaluru, India",
    projectType: "Creative Campus",
    serviceType: "Planning Commercial",
    category: "Planning Commercial",
    status: "READY_FOR_REVIEW",
    priority: "HIGH",
    area: "12,200 sq ft",
    year: "2026",
    duration: "18 months",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    summary:
      "A studio campus designed as a shaded courtyard network with gallery workshops, flexible collaboration pods, and an event terrace.",
  },
  {
    title: "Stone Horizon Estate",
    location: "Jaipur, India",
    projectType: "Desert Retreat",
    serviceType: "Exterior Design",
    category: "Exterior Design",
    status: "PENDING",
    priority: "HIGH",
    area: "14,900 sq ft",
    year: "2026",
    duration: "20 months",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    summary:
      "A monolithic retreat carved from textured stone volumes with quiet courtyards, shaded pergolas, and a meditative arrival sequence.",
  },
  {
    title: "Skyline Atelier",
    location: "Mumbai, India",
    projectType: "Mixed-use Residence",
    serviceType: "3D Renders",
    category: "3D Renders",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    area: "9,800 sq ft",
    year: "2026",
    duration: "14 months",
    coordinates: { lat: 19.076, lng: 72.8777 },
    summary:
      "A vertical residence tower with gallery decks, open terraces, and a wellness floor tailored for dense urban living.",
  },
  {
    title: "Verdant Lobby Refresh",
    location: "Pune, India",
    projectType: "Hospitality Interior",
    serviceType: "Interior Design",
    category: "Interior Design",
    status: "CHANGES_REQUESTED",
    priority: "MEDIUM",
    area: "4,600 sq ft",
    year: "2026",
    duration: "8 months",
    coordinates: { lat: 18.5204, lng: 73.8567 },
    summary:
      "A boutique hospitality reception concept with warm stone, bronze detailing, and layered ambient lighting.",
  },
  {
    title: "Harbor Walkthrough Film",
    location: "Chennai, India",
    projectType: "Sales Walkthrough",
    serviceType: "Walkthrough Editing",
    category: "Walkthrough Editing",
    status: "IN_PROGRESS",
    priority: "HIGH",
    area: "NA",
    year: "2026",
    duration: "6 weeks",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    summary:
      "A premium cinematic walkthrough package for a waterfront condominium launch.",
  },
  {
    title: "Oakline Furniture Suite",
    location: "Hyderabad, India",
    projectType: "Custom Furniture Collection",
    serviceType: "Furniture Design",
    category: "Furniture Design",
    status: "PENDING",
    priority: "LOW",
    area: "Collection",
    year: "2026",
    duration: "10 weeks",
    coordinates: { lat: 17.385, lng: 78.4867 },
    summary:
      "A coordinated furniture suite for a private residence including dining, bedroom, and library pieces.",
  },
  {
    title: "Palm Crest Elevations",
    location: "Kochi, India",
    projectType: "Residential Elevation Package",
    serviceType: "Elevation Design",
    category: "Elevation Design",
    status: "READY_FOR_REVIEW",
    priority: "MEDIUM",
    area: "6,200 sq ft",
    year: "2026",
    duration: "9 weeks",
    coordinates: { lat: 9.9312, lng: 76.2673 },
    summary:
      "Facade studies, material articulation, and lighting simulations for a tropical villa compound.",
  },
  {
    title: "Crescent Boardroom",
    location: "Delhi, India",
    projectType: "Commercial Interior",
    serviceType: "Interior Design",
    category: "Interior Design",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    area: "3,900 sq ft",
    year: "2026",
    duration: "12 weeks",
    coordinates: { lat: 28.6139, lng: 77.209 },
    summary:
      "A boardroom and executive suite refresh with acoustic wall systems and premium material detailing.",
  },
  {
    title: "Verve Cost Package",
    location: "Ahmedabad, India",
    projectType: "Budget and Estimation",
    serviceType: "Cost and Estimation",
    category: "Cost and Estimation",
    status: "PENDING",
    priority: "MEDIUM",
    area: "Portfolio",
    year: "2026",
    duration: "4 weeks",
    coordinates: { lat: 23.0225, lng: 72.5714 },
    summary:
      "A structured cost plan and value engineering package for a mixed-use urban development.",
  },
  {
    title: "Solstice Exterior Frames",
    location: "Udaipur, India",
    projectType: "Resort Facade Design",
    serviceType: "Exterior Design",
    category: "Exterior Design",
    status: "COMPLETED",
    priority: "LOW",
    area: "11,100 sq ft",
    year: "2025",
    duration: "11 months",
    coordinates: { lat: 24.5854, lng: 73.7125 },
    summary:
      "A façade envelope design with lattice screens, deep verandahs, and passive cooling strategies.",
  },
  {
    title: "Cityline Walkthrough",
    location: "Surat, India",
    projectType: "Real Estate Animation",
    serviceType: "Walkthrough",
    category: "Walkthrough",
    status: "PENDING",
    priority: "HIGH",
    area: "Sales asset",
    year: "2026",
    duration: "5 weeks",
    coordinates: { lat: 21.1702, lng: 72.8311 },
    summary:
      "A sales walkthrough for a residential tower launch with day and dusk cinematic sequences.",
  },
];

module.exports = {
  users,
  seedCredentials,
  serviceCatalog,
  imageSets,
};
