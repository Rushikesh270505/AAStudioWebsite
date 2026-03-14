const connectDB = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Message = require("../models/Message");
const Invoice = require("../models/Invoice");
const FileAsset = require("../models/FileAsset");
const ProjectCollaborator = require("../models/ProjectCollaborator");
const ProjectUpdate = require("../models/ProjectUpdate");
const Meeting = require("../models/Meeting");
const SiteVisit = require("../models/SiteVisit");
const Notification = require("../models/Notification");
const Invite = require("../models/Invite");
const ContactLead = require("../models/ContactLead");
const AuditLog = require("../models/AuditLog");
const { users, serviceCatalog, seedCredentials, imageSets } = require("../utils/seedData");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Message.deleteMany({}),
    Invoice.deleteMany({}),
    FileAsset.deleteMany({}),
    ProjectCollaborator.deleteMany({}),
    ProjectUpdate.deleteMany({}),
    Meeting.deleteMany({}),
    SiteVisit.deleteMany({}),
    Notification.deleteMany({}),
    Invite.deleteMany({}),
    ContactLead.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const createdUsers = await User.create(users);

  const admin = createdUsers.find((user) => user.role === "admin");
  const architects = createdUsers.filter((user) => user.role === "architect");
  const clients = createdUsers.filter((user) => user.role === "client");

  const createdProjects = [];
  for (let index = 0; index < serviceCatalog.length; index += 1) {
    const item = serviceCatalog[index];
    const imageSet = imageSets[index % imageSets.length];
    const assignedClient = clients[index % clients.length];
    const assignedArchitect = item.status === "PENDING" ? null : architects[index % architects.length];

    const project = await Project.create({
      projectCode: `AA-${String(index + 1).padStart(4, "0")}`,
      title: item.title,
      slug: slugify(item.title),
      location: item.location,
      projectType: item.projectType,
      category: item.category,
      serviceType: item.serviceType,
      summary: item.summary,
      description: item.summary,
      status: item.status,
      priority: item.priority,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index + 7)),
      heroImage: imageSet.hero,
      gallery: imageSet.gallery,
      year: item.year,
      area: item.area,
      duration: item.duration,
      coordinates: item.coordinates,
      modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      walkthroughUrl:
        index % 2 === 0
          ? "https://assets.mixkit.co/videos/preview/mixkit-modern-house-exterior-architecture-51435-large.mp4"
          : "https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-modern-house-11119-large.mp4",
      architect: assignedArchitect?._id,
      mainArchitect: assignedArchitect?._id,
      client: assignedClient?._id,
      createdByAdmin: admin._id,
      quotation: {
        amount: 12000 + index * 1500,
        currency: "USD",
        summary: `${item.serviceType} proposal with review cycles and delivery support.`,
      },
      paymentMilestones: [
        {
          label: "Advance",
          amount: 3000 + index * 300,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
          status: index % 3 === 0 ? "Paid" : "Scheduled",
        },
        {
          label: "Final delivery",
          amount: 9000 + index * 1200,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
          status: "Pending",
        },
      ],
      timeline: [
        {
          title: "Brief received",
          status: "Delivered",
          date: "Mar 01, 2026",
          note: "Initial brief package reviewed and distributed internally.",
        },
        {
          title: "Production milestone",
          status: item.status,
          date: "Mar 08, 2026",
          note: `Current workflow state is ${item.status.toLowerCase().replace(/_/g, " ")}.`,
        },
      ],
      latestReportAt: assignedArchitect ? new Date() : undefined,
      readyForReviewAt: item.status === "READY_FOR_REVIEW" ? new Date() : undefined,
      completedAt: item.status === "COMPLETED" ? new Date() : undefined,
      tags: [item.category, item.serviceType],
    });

    createdProjects.push(project);
  }

  for (let index = 0; index < createdProjects.length; index += 1) {
    const project = createdProjects[index];
    const architect = architects[index % architects.length];
    const secondaryArchitect = architects[(index + 1) % architects.length];
    const client = clients[index % clients.length];

    if (project.mainArchitect && project.status !== "PENDING") {
      await ProjectCollaborator.create({
        project: project._id,
        architect: secondaryArchitect._id,
        addedBy: admin._id,
      });
    }

    const files = await FileAsset.create([
      {
        name: `${project.projectCode}-brief.pdf`,
        url: "https://example.com/files/brief.pdf",
        key: `${project.projectCode}-brief`,
        kind: "pdf",
        project: project._id,
        uploadedBy: admin._id,
        description: "Project brief and scope definition.",
      },
      {
        name: `${project.projectCode}-model.glb`,
        url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        key: `${project.projectCode}-model`,
        kind: "model",
        project: project._id,
        uploadedBy: architect._id,
        description: "Review model for browser inspection.",
      },
    ]);

    project.files = files.map((file) => file._id);
    await project.save();

    await ProjectUpdate.create([
      {
        project: project._id,
        author: admin._id,
        updateType: "SYSTEM",
        message: "Project created by admin and distributed to the production board.",
        tag: "Kickoff",
      },
      {
        project: project._id,
        author: project.mainArchitect || architect._id,
        updateType: "DAILY_REPORT",
        message: "Shared working files, aligned delivery milestones, and noted the first round of reference adjustments.",
        tag: "EOD",
      },
      {
        project: project._id,
        author: client._id,
        updateType: "REVISION_REQUEST",
        message: "Please keep the evening lighting warmer and emphasize the courtyard threshold.",
        tag: "Client feedback",
      },
    ]);

    await Invoice.create({
      invoiceNumber: `INV-${String(index + 1).padStart(3, "0")}`,
      project: project._id,
      client: client._id,
      amount: 12000 + index * 1500,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index + 10)),
      status: index % 4 === 0 ? "Paid" : index % 2 === 0 ? "Due" : "Scheduled",
      paymentPhase: "Production",
      notes: "Sample seeded invoice for the client portal.",
      lineItems: [
        { label: `${project.serviceType} package`, amount: 8000 + index * 500 },
        { label: "Revision cycles", amount: 4000 + index * 200 },
      ],
    });

    await Meeting.create({
      title: `${project.title} weekly review`,
      project: project._id,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index + 2)),
      participants: [admin._id, client._id, project.mainArchitect || architect._id],
      notes: "Weekly checkpoint with progress review and next action list.",
      location: "Google Meet",
    });

    if (index % 2 === 0) {
      await SiteVisit.create({
        project: project._id,
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index + 5)),
        location: `${project.location} site review`,
        assignedStaff: [admin._id, project.mainArchitect || architect._id],
        notes: "Site verification and measurement capture.",
      });
    }

    await Notification.create([
      {
        user: client._id,
        type: "PROJECT_ASSIGNED",
        title: "Project visible in portal",
        message: `${project.title} is available in your dashboard.`,
        relatedProject: project._id,
        actionUrl: `/client/projects/${project._id}`,
      },
      {
        user: architect._id,
        type: "PROJECT_UPDATE",
        title: "Daily workflow seeded",
        message: `${project.title} has sample updates and files ready for demo.`,
        relatedProject: project._id,
        actionUrl: `/architect/projects/${project._id}`,
      },
    ]);

    await AuditLog.create({
      action: "SEED_PROJECT_CREATED",
      actor: admin._id,
      project: project._id,
      metadata: { projectCode: project.projectCode },
    });
  }

  await ContactLead.create([
    {
      fullName: "Ritika Anand",
      email: "ritika.lead@example.com",
      phone: "+91 98765 44444",
      projectType: "Private residence",
      budget: "$500k - $1M",
      message: "Need concept design and a premium walkthrough for a sea-facing villa plot.",
    },
    {
      fullName: "Arjun Verma",
      email: "arjun.lead@example.com",
      phone: "+91 98765 55555",
      projectType: "Hospitality",
      budget: "$1M+",
      message: "Looking for a full architecture + interiors scope for a boutique stay concept.",
    },
  ]);

  await Invite.create([
    {
      email: "candidate.architect@example.com",
      role: "architect",
      invitedBy: admin._id,
      token: crypto.randomBytes(20).toString("hex"),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      companyArchitectId: "ARCH-1201",
    },
  ]);

  for (const user of createdUsers) {
    const assignedProjects = createdProjects
      .filter(
        (project) =>
          project.client?.toString() === user._id.toString() ||
          project.mainArchitect?.toString() === user._id.toString(),
      )
      .map((project) => project._id);

    user.assignedProjects = assignedProjects;
    await user.save();
  }

  console.log("Seed complete. Core accounts:");
  seedCredentials.forEach((credential) => {
    console.log(`- ${credential.role}: ${credential.email} / ${credential.password}`);
  });
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
