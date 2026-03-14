const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { buildAvatarUrl } = require("../utils/avatar");
const { USER_ROLES } = require("../utils/constants");

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9@._-]/g, "");
}

function deriveUsername(source) {
  const normalized = normalizeUsername(source);
  return normalized || undefined;
}

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "client",
    },
    studioName: String,
    phone: String,
    avatarSeed: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    companyArchitectId: {
      type: String,
      trim: true,
    },
    specializationTags: [String],
    bio: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("validate", function syncProfileFields(next) {
  if (this.username) {
    this.username = normalizeUsername(this.username);
  }

  if (!this.username && this.email) {
    this.username = deriveUsername(this.email.split("@")[0]);
  }

  if (!this.username && (this.fullName || this.name)) {
    this.username = deriveUsername(this.fullName || this.name);
  }

  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }

  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }

  if (!this.fullName && this.username) {
    this.fullName = this.username;
  }

  if (!this.name && this.username) {
    this.name = this.username;
  }

  if (!this.avatarSeed && this.email) {
    this.avatarSeed = `${this.email}-${Date.now()}`;
  }

  if (!this.avatarUrl && this.avatarSeed) {
    this.avatarUrl = buildAvatarUrl(this.avatarSeed);
  }

  next();
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
