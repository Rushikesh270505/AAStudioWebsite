export type ProjectAsset = {
  title: string;
  description: string;
  image: string;
};

export type ProjectData = {
  slug: string;
  title: string;
  location: string;
  projectType: string;
  summary: string;
  status: "Concept" | "In Construction" | "Completed";
  area: string;
  year: string;
  duration: string;
  heroImage: string;
  gallery: string[];
  plans: ProjectAsset[];
  elevations: ProjectAsset[];
  renderImages: string[];
  walkthroughVideo: string;
  modelUrl?: string;
  coordinates: [number, number];
  timeline: Array<{
    title: string;
    status: string;
    date: string;
    note: string;
  }>;
};

export const studioProjects: ProjectData[] = [
  {
    slug: "horizon-residence",
    title: "Horizon Residence",
    location: "North Goa, India",
    projectType: "Coastal Private Villa",
    summary:
      "A layered waterfront residence composed around sea-facing courts, shaded colonnades, and a double-height living gallery.",
    status: "Completed",
    area: "8,400 sq ft",
    year: "2025",
    duration: "16 months",
    heroImage:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=80",
    ],
    plans: [
      {
        title: "Ground Level Plan",
        description: "Arrival court, gallery foyer, pool deck, and service spine.",
        image:
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Upper Level Plan",
        description: "Private bedroom wing with terraces aligned to the sunset axis.",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    elevations: [
      {
        title: "Sea-Facing Elevation",
        description: "Deep slab projections and stone fins manage glare and privacy.",
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Arrival Elevation",
        description: "A restrained facade with carved openings and warm evening light.",
        image:
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    renderImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
    ],
    walkthroughVideo:
      "https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-modern-house-11119-large.mp4",
    coordinates: [15.2993, 74.124],
    timeline: [
      {
        title: "Concept approval",
        status: "Approved",
        date: "Feb 06, 2024",
        note: "Climate and view studies locked with the client team.",
      },
      {
        title: "Technical drawing package",
        status: "Delivered",
        date: "May 14, 2024",
        note: "Plans, elevations, sections, and BOQ issued for contractor pricing.",
      },
      {
        title: "Interior styling handover",
        status: "Delivered",
        date: "Jan 22, 2025",
        note: "Furniture layouts and softscape set completed.",
      },
    ],
  },
  {
    slug: "atelier-courtyard",
    title: "Atelier Courtyard",
    location: "Bengaluru, India",
    projectType: "Creative Campus",
    summary:
      "A studio campus designed as a shaded courtyard network with gallery workshops, flexible collaboration pods, and an event terrace.",
    status: "In Construction",
    area: "12,200 sq ft",
    year: "2026",
    duration: "18 months",
    heroImage:
      "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=80",
    ],
    plans: [
      {
        title: "Studio Floor Plate",
        description: "Flexible work bays arranged around a planted social spine.",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Event Terrace Plan",
        description: "Open-air screening zone with retractable canopies.",
        image:
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    elevations: [
      {
        title: "North Facade",
        description: "Terracotta rainscreen with recessed glazing and bronze details.",
        image:
          "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Courtyard Section",
        description: "Passive stack ventilation through planted voids and skylights.",
        image:
          "https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    renderImages: [
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=80",
    ],
    walkthroughVideo:
      "https://assets.mixkit.co/videos/preview/mixkit-modern-house-exterior-architecture-51435-large.mp4",
    coordinates: [12.9716, 77.5946],
    timeline: [
      {
        title: "Schematic design",
        status: "Approved",
        date: "Oct 10, 2025",
        note: "Client sign-off on workspace zoning and facade direction.",
      },
      {
        title: "Facade mockup",
        status: "Under review",
        date: "Jan 08, 2026",
        note: "Rainscreen mockups uploaded for material benchmarking.",
      },
      {
        title: "Site mobilization",
        status: "Active",
        date: "Mar 03, 2026",
        note: "Civil package and structural coordination underway.",
      },
    ],
  },
  {
    slug: "stone-horizon-estate",
    title: "Stone Horizon Estate",
    location: "Jaipur, India",
    projectType: "Desert Retreat",
    summary:
      "A monolithic retreat carved from textured stone volumes with quiet courtyards, shaded pergolas, and a meditative arrival sequence.",
    status: "Concept",
    area: "14,900 sq ft",
    year: "2026",
    duration: "20 months",
    heroImage:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1600&q=80",
    ],
    plans: [
      {
        title: "Master Plan",
        description: "Guest suites, wellness court, and dune-view pavilion network.",
        image:
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Wellness Wing",
        description: "Hydrotherapy pools and private spa rooms around a sunken court.",
        image:
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    elevations: [
      {
        title: "Sunset Facade",
        description: "Layered stone fins cast dramatic shadows across the plinth.",
        image:
          "https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Courtyard Perspective",
        description: "Carved openings frame landscape water bodies and sculpted stairs.",
        image:
          "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    renderImages: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
    ],
    walkthroughVideo:
      "https://assets.mixkit.co/videos/preview/mixkit-stylish-house-with-pool-4185-large.mp4",
    coordinates: [26.9124, 75.7873],
    timeline: [
      {
        title: "Site analysis",
        status: "Delivered",
        date: "Dec 02, 2025",
        note: "Heat gain, wind, and dune retention simulations uploaded.",
      },
      {
        title: "Concept presentation",
        status: "Pending",
        date: "Mar 20, 2026",
        note: "Client walkthrough preview and physical model review scheduled.",
      },
      {
        title: "Visualization package",
        status: "Pending",
        date: "Apr 04, 2026",
        note: "Aerial renders and nighttime lighting studies queued for delivery.",
      },
    ],
  },
];

export const services = [
  {
    title: "Architecture Design",
    description:
      "Master planning, concept architecture, design development, and construction documentation for high-end residential and hospitality projects.",
  },
  {
    title: "Interior Environments",
    description:
      "Spatial storytelling, material curation, bespoke furniture, and styling packages that align with the architectural language.",
  },
  {
    title: "3D Visualization",
    description:
      "Interactive WebGL viewers, cinematic walkthroughs, and client-ready presentations for faster approvals and remote collaboration.",
  },
  {
    title: "Project Delivery",
    description:
      "Client dashboards, milestone tracking, invoice control, consultant coordination, and document management in one operating layer.",
  },
];

export const studioStats = [
  { label: "Projects under management", value: "24" },
  { label: "Studio delivery cities", value: "11" },
  { label: "Average client approval gain", value: "37%" },
  { label: "Walkthrough sessions hosted", value: "540+" },
];

export const principles = [
  "Architecture shaped by climate, context, and quiet material confidence.",
  "Spatial systems designed for decisive client approvals and execution clarity.",
  "Digital delivery tools that turn the studio website into an active operating platform.",
];

export const dashboardFiles = [
  {
    name: "Tender drawing set",
    type: "PDF",
    size: "18.4 MB",
    updatedAt: "Mar 12, 2026",
  },
  {
    name: "Facade material board",
    type: "Images",
    size: "96 MB",
    updatedAt: "Mar 10, 2026",
  },
  {
    name: "3D coordination model",
    type: "GLB",
    size: "42 MB",
    updatedAt: "Mar 09, 2026",
  },
  {
    name: "Night walkthrough render",
    type: "Video",
    size: "210 MB",
    updatedAt: "Mar 07, 2026",
  },
];

export const dashboardMessages = [
  {
    from: "Lead Architect",
    preview:
      "Updated the staircase railing detail and uploaded the revised elevation sheet for review.",
    time: "10:30 AM",
  },
  {
    from: "Project Manager",
    preview:
      "Invoice 03 is ready and linked to the dashboard with supporting vendor notes.",
    time: "Yesterday",
  },
  {
    from: "Visualization Team",
    preview:
      "Interactive lighting presets are now available in the viewer for dusk and interior night scenes.",
    time: "Mar 11",
  },
];

export const dashboardInvoices = [
  { id: "INV-001", amount: "$18,500", dueDate: "Mar 18, 2026", status: "Due" },
  { id: "INV-002", amount: "$12,000", dueDate: "Apr 06, 2026", status: "Scheduled" },
  { id: "INV-003", amount: "$6,800", dueDate: "Feb 26, 2026", status: "Paid" },
];

export const dashboardOverview = [
  { label: "Active project phase", value: "Construction Coordination" },
  { label: "Next review", value: "Mar 19, 2026 at 3:00 PM" },
  { label: "Assigned architect", value: "Aarav Mehta" },
  { label: "Current completion", value: "68%" },
];

export const loginDemoProfiles = [
  { role: "Architect", email: "architect.demo@example.com" },
  { role: "Client", email: "client.demo@example.com" },
  { role: "Admin", email: "admin.demo@example.com" },
];
