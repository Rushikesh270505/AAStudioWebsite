const connectDB = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Message = require("../models/Message");
const Invoice = require("../models/Invoice");
const { users, projects, seedCredentials } = require("../utils/seedData");

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Message.deleteMany({}),
    Invoice.deleteMany({}),
  ]);

  const createdUsers = await User.create(users);
  const architect = createdUsers.find((user) => user.role === "architect");
  const client = createdUsers.find((user) => user.role === "client");

  const createdProjects = await Project.create(
    projects.map((project) => ({
      ...project,
      architect: architect._id,
      client: client._id,
    })),
  );

  client.assignedProjects = createdProjects.map((project) => project._id);
  await client.save();

  await Message.create([
    {
      project: createdProjects[1]._id,
      sender: architect._id,
      recipient: client._id,
      body: "Updated the staircase railing detail and linked the revised elevation package.",
    },
    {
      project: createdProjects[1]._id,
      sender: client._id,
      recipient: architect._id,
      body: "Please keep the courtyard lighting slightly warmer for the dusk walkthrough preset.",
    },
  ]);

  await Invoice.create([
    {
      invoiceNumber: "INV-001",
      project: createdProjects[1]._id,
      client: client._id,
      amount: 18500,
      dueDate: new Date("2026-03-18"),
      status: "Due",
      lineItems: [
        { label: "Construction coordination", amount: 12000 },
        { label: "Visualization update package", amount: 6500 },
      ],
    },
    {
      invoiceNumber: "INV-002",
      project: createdProjects[1]._id,
      client: client._id,
      amount: 12000,
      dueDate: new Date("2026-04-06"),
      status: "Scheduled",
      lineItems: [{ label: "Facade shop drawing review", amount: 12000 }],
    },
  ]);

  console.log("Seed complete. Demo users:");
  seedCredentials.forEach((credential) => {
    console.log(`- ${credential.role}: ${credential.email} / ${credential.password}`);
  });
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
