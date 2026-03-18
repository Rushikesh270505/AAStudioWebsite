const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const VerificationCode = require("../models/VerificationCode");
const WorkReport = require("../models/WorkReport");
const env = require("../config/env");
const { buildAvatarUrl } = require("../utils/avatar");
const { isAllowedAdminUsername } = require("../utils/adminAccounts");
const { deliverOtp, generateOtpCode, normalizeRecipient } = require("../utils/otp");

function signToken(id) {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "7d" });
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isSupportedOtpChannel(channel) {
  return ["email", "phone"].includes(channel);
}

function normalizeIdentifier(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeUsername(value) {
  return normalizeIdentifier(value).replace(/\s+/g, "").replace(/[^a-z0-9@._-]/g, "");
}

function findUserByIdentifier(identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier);

  if (!normalizedIdentifier) {
    return null;
  }

  return User.findOne({
    $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
  });
}

function assertAdminAccountAllowed(user) {
  if (user.role === "admin" && !isAllowedAdminUsername(user.username)) {
    throw createHttpError(403, "This admin account is not authorized for the control panel.");
  }
}

async function getVerifiedOtp(channel, recipient, purpose) {
  return VerificationCode.findOne({
    channel,
    recipient,
    purpose,
    verifiedAt: { $ne: null },
    expiresAt: { $gt: new Date() },
  }).sort({ verifiedAt: -1, createdAt: -1 });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName || user.name,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    studioName: user.studioName,
    phone: user.phone,
    avatarSeed: user.avatarSeed,
    avatarUrl: user.avatarUrl,
    companyArchitectId: user.companyArchitectId,
    isActive: user.isActive,
    isOnline: user.isOnline,
    lastLoginAt: user.lastLoginAt,
    lastReportAt: user.lastReportAt,
    specializationTags: user.specializationTags || [],
  };
}

async function markArchitectOnline(user) {
  if (user.role !== "architect") {
    return user;
  }

  user.isOnline = true;
  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

async function register(req, res) {
  const {
    username,
    email,
    password,
    role,
    studioName,
    phone,
    avatarSeed,
  } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || !normalizedEmail || !password || !normalizedPhone) {
    throw createHttpError(400, "Username, email, phone number, and password are required.");
  }

  const emailVerification = await getVerifiedOtp("email", normalizedEmail, "signup");

  if (!emailVerification) {
    throw createHttpError(400, "Verify your email OTP before creating the account.");
  }

  const [existingEmailUser, existingPhoneUser, existingUsernameUser] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    User.findOne({ phone: normalizedPhone }),
    User.findOne({ username: normalizedUsername }),
  ]);

  if (existingEmailUser) {
    throw createHttpError(400, "User already exists for this email.");
  }

  if (existingPhoneUser) {
    throw createHttpError(400, "User already exists for this phone number.");
  }

  if (existingUsernameUser) {
    throw createHttpError(400, "That username is already taken.");
  }

  const finalRole = role === "public_user" ? "public_user" : "client";
  const resolvedName = normalizedUsername;
  const resolvedSeed = avatarSeed || `${normalizedUsername}-${crypto.randomBytes(4).toString("hex")}`;

  const user = await User.create({
    fullName: resolvedName,
    name: resolvedName,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role: finalRole,
    studioName,
    phone: normalizedPhone,
    avatarSeed: resolvedSeed,
    avatarUrl: buildAvatarUrl(resolvedSeed),
    onboardingCompleted: true,
  });

  await VerificationCode.deleteMany({
    _id: {
      $in: [emailVerification._id],
    },
  });

  const token = signToken(user._id.toString());

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
}

async function login(req, res) {
  const { identifier, email, username, password } = req.body;
  const resolvedIdentifier = identifier || email || username;

  if (!resolvedIdentifier || !password) {
    return res.status(400).json({ message: "Email/username and password are required." });
  }

  const lookup = findUserByIdentifier(resolvedIdentifier);
  const user = lookup ? await lookup.select("+password") : null;

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email/username or password." });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Your account has been deactivated. Contact an administrator." });
  }

  assertAdminAccountAllowed(user);
  await markArchitectOnline(user);

  const token = signToken(user._id.toString());

  return res.json({
    token,
    user: sanitizeUser(user),
  });
}

async function staffLogin(req, res) {
  const { identifier, email, username, password } = req.body;
  const resolvedIdentifier = identifier || email || username;

  if (!resolvedIdentifier || !password) {
    return res.status(400).json({ message: "Email/username and password are required." });
  }

  const lookup = findUserByIdentifier(resolvedIdentifier);
  const user = lookup ? await lookup.select("+password") : null;

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email/username or password." });
  }

  if (!["architect", "admin"].includes(user.role)) {
    return res.status(403).json({ message: "Staff login is only available to architect and admin accounts." });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Your staff account has been deactivated." });
  }

  assertAdminAccountAllowed(user);
  await markArchitectOnline(user);

  const token = signToken(user._id.toString());
  return res.json({
    token,
    user: sanitizeUser(user),
  });
}

async function forgotPassword(req, res) {
  const email = normalizeIdentifier(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      message: "If an account exists for that email, an OTP has been sent.",
      channel: "email",
      recipient: email,
      expiresInMinutes: env.OTP_TTL_MINUTES,
    });
  }

  await VerificationCode.deleteMany({
    channel: "email",
    recipient: email,
    purpose: "login",
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);

  await VerificationCode.create({
    channel: "email",
    recipient: email,
    purpose: "login",
    code,
    expiresAt,
  });

  const delivery = await deliverOtp({
    channel: "email",
    recipient: email,
    code,
    purpose: "reset",
  });

  return res.json({
    message: "If an account exists for that email, an OTP has been sent.",
    channel: "email",
    recipient: email,
    expiresInMinutes: env.OTP_TTL_MINUTES,
    ...(delivery.debugCode ? { debugCode: delivery.debugCode } : {}),
  });
}

async function requestOtp(req, res) {
  const { channel, recipient, purpose = "signup" } = req.body;

  if (!isSupportedOtpChannel(channel)) {
    throw createHttpError(400, "OTP channel must be email or phone.");
  }

  if (!recipient || typeof recipient !== "string") {
    throw createHttpError(400, "Recipient is required.");
  }

  const normalizedRecipient = normalizeRecipient(channel, recipient);

  if (purpose === "signup") {
    const existingUser = await User.findOne(channel === "email" ? { email: normalizedRecipient } : { phone: normalizedRecipient });

    if (existingUser) {
      throw createHttpError(
        400,
        channel === "email" ? "An account already exists for this email." : "An account already exists for this phone number.",
      );
    }
  }

  if (purpose === "login") {
    if (channel !== "email") {
      throw createHttpError(400, "Login OTP is only available over email.");
    }

    const existingUser = await User.findOne({ email: normalizedRecipient });

    if (!existingUser) {
      throw createHttpError(404, "No account was found for that email address.");
    }
  }

  await VerificationCode.deleteMany({
    channel,
    recipient: normalizedRecipient,
    purpose,
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);

  await VerificationCode.create({
    channel,
    recipient: normalizedRecipient,
    purpose,
    code,
    expiresAt,
  });

  const delivery = await deliverOtp({
    channel,
    recipient: normalizedRecipient,
    code,
    purpose,
  });

  return res.json({
    message: `${channel === "email" ? "Email" : "Phone"} OTP sent successfully.`,
    channel,
    recipient: normalizedRecipient,
    expiresInMinutes: env.OTP_TTL_MINUTES,
    ...(delivery.debugCode ? { debugCode: delivery.debugCode } : {}),
  });
}

async function verifyOtp(req, res) {
  const { channel, recipient, code, purpose = "signup" } = req.body;

  if (!isSupportedOtpChannel(channel)) {
    throw createHttpError(400, "OTP channel must be email or phone.");
  }

  if (!recipient || typeof recipient !== "string" || !code || typeof code !== "string") {
    throw createHttpError(400, "Recipient and OTP code are required.");
  }

  const normalizedRecipient = normalizeRecipient(channel, recipient);

  const verification = await VerificationCode.findOne({
    channel,
    recipient: normalizedRecipient,
    purpose,
    code: code.trim(),
    verifiedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!verification) {
    throw createHttpError(400, "Invalid or expired OTP.");
  }

  verification.verifiedAt = new Date();
  await verification.save();

  return res.json({
    message: `${channel === "email" ? "Email" : "Phone"} verified successfully.`,
    channel,
    recipient: normalizedRecipient,
    verified: true,
  });
}

async function loginWithOtp(req, res) {
  if (!req.body.email) {
    throw createHttpError(400, "Email and OTP code are required.");
  }

  const normalizedEmail = normalizeRecipient("email", req.body.email);
  const code = String(req.body.code || "").trim();

  if (!normalizedEmail || !code) {
    throw createHttpError(400, "Email and OTP code are required.");
  }

  const verification = await VerificationCode.findOne({
    channel: "email",
    recipient: normalizedEmail,
    purpose: "login",
    code,
    verifiedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!verification) {
    throw createHttpError(400, "Invalid or expired OTP.");
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw createHttpError(404, "No account was found for that email address.");
  }

  if (!user.isActive) {
    throw createHttpError(403, "Your account has been deactivated. Contact an administrator.");
  }

  assertAdminAccountAllowed(user);
  await markArchitectOnline(user);

  verification.verifiedAt = new Date();
  await verification.save();
  await VerificationCode.deleteMany({ channel: "email", recipient: normalizedEmail, purpose: "login" });

  return res.json({
    token: signToken(user._id.toString()),
    user: sanitizeUser(user),
  });
}

async function getCurrentUser(req, res) {
  return res.json({
    user: sanitizeUser(req.user),
  });
}

async function logout(req, res) {
  if (req.user.role === "architect") {
    const cutoff = req.user.lastLoginAt ? new Date(req.user.lastLoginAt) : new Date(0);
    const reportForSession = await WorkReport.exists({
      architect: req.user._id,
      createdAt: { $gte: cutoff },
    });

    if (!reportForSession) {
      throw createHttpError(400, "Submit today\u2019s report before signing out.");
    }

    req.user.isOnline = false;
    await req.user.save();
  }

  return res.json({ message: "Signed out successfully." });
}

module.exports = {
  register,
  login,
  staffLogin,
  forgotPassword,
  requestOtp,
  verifyOtp,
  loginWithOtp,
  getCurrentUser,
  logout,
};
