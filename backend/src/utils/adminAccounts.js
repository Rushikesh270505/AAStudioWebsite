const { buildAvatarUrl } = require("./avatar");

const ALLOWED_ADMIN_USERNAMES = ["admin@akhilkatari", "admin@rushikeshkatari"];

const BOOTSTRAP_ADMIN_ACCOUNTS = [
  {
    username: "admin@akhilkatari",
    email: "akhil.admin@artandarchitecture.internal",
    fullName: "Akhil Katari",
    passwordHash: "$2b$12$HujNrEJVOHFF7u0tXt6nkeIRRa4B.DJHunUTgDKyJ73OqJl/31D0.",
  },
  {
    username: "admin@rushikeshkatari",
    email: "rushikesh.admin@artandarchitecture.internal",
    fullName: "Rushikesh Katari",
    passwordHash: "$2b$12$ET7FucrU8IFzg4/gKpe8Q.axDhIb0q5e85SpUnmhzMs4wiICvuIaC",
  },
];

function normalizeAdminUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isAllowedAdminUsername(value) {
  return ALLOWED_ADMIN_USERNAMES.includes(normalizeAdminUsername(value));
}

async function ensureDefaultAdminAccounts(User) {
  for (const account of BOOTSTRAP_ADMIN_ACCOUNTS) {
    const avatarSeed = `${account.username}-admin`;

    await User.updateOne(
      { username: account.username },
      {
        $set: {
          username: account.username,
          email: account.email,
          fullName: account.fullName,
          name: account.fullName,
          password: account.passwordHash,
          role: "admin",
          studioName: "Art and Architecture Studios",
          avatarSeed,
          avatarUrl: buildAvatarUrl(avatarSeed),
          isActive: true,
          onboardingCompleted: true,
        },
      },
      { upsert: true },
    );
  }
}

module.exports = {
  ALLOWED_ADMIN_USERNAMES,
  isAllowedAdminUsername,
  ensureDefaultAdminAccounts,
};
