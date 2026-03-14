const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const VerificationCode = require("../models/VerificationCode");
const env = require("../config/env");
const { buildAvatarUrl } = require("../utils/avatar");
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
    email: user.email,
    role: user.role,
    studioName: user.studioName,
    phone: user.phone,
    avatarSeed: user.avatarSeed,
    avatarUrl: user.avatarUrl,
    companyArchitectId: user.companyArchitectId,
    isActive: user.isActive,
    specializationTags: user.specializationTags || [],
  };
}

async function register(req, res) {
  const {
    fullName,
    name,
    email,
    password,
    role,
    studioName,
    phone,
    avatarSeed,
  } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();

  if (!normalizedEmail || !password || !(fullName || name) || !normalizedPhone) {
    throw createHttpError(400, "Full name, email, phone number, and password are required.");
  }

  const [emailVerification, phoneVerification] = await Promise.all([
    getVerifiedOtp("email", normalizedEmail, "signup"),
    getVerifiedOtp("phone", normalizedPhone, "signup"),
  ]);

  if (!emailVerification || !phoneVerification) {
    throw createHttpError(400, "Verify both email OTP and phone OTP before creating the account.");
  }

  const [existingEmailUser, existingPhoneUser] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    User.findOne({ phone: normalizedPhone }),
  ]);

  if (existingEmailUser) {
    throw createHttpError(400, "User already exists for this email.");
  }

  if (existingPhoneUser) {
    throw createHttpError(400, "User already exists for this phone number.");
  }

  const finalRole = role === "public_user" ? "public_user" : "client";
  const resolvedName = fullName || name;
  const resolvedSeed = avatarSeed || `${resolvedName}-${crypto.randomBytes(4).toString("hex")}`;

  const user = await User.create({
    fullName: resolvedName,
    name: resolvedName,
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
      $in: [emailVerification._id, phoneVerification._id],
    },
  });

  const token = signToken(user._id.toString());

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Your account has been deactivated. Contact an administrator." });
  }

  const token = signToken(user._id.toString());

  return res.json({
    token,
    user: sanitizeUser(user),
  });
}

async function staffLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (!["architect", "admin"].includes(user.role)) {
    return res.status(403).json({ message: "Staff login is only available to architect and admin accounts." });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Your staff account has been deactivated." });
  }

  const token = signToken(user._id.toString());
  return res.json({
    token,
    user: sanitizeUser(user),
  });
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = await User.findOne({ email });

  return res.json({
    message: user
      ? "Password reset request recorded. Connect an email provider to deliver reset links."
      : "If an account exists for that email, a reset link will be sent.",
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
    const existingUser = await User.findOne(
      channel === "email" ? { email: normalizedRecipient } : { phone: normalizedRecipient },
    );

    if (existingUser) {
      throw createHttpError(
        400,
        channel === "email"
          ? "An account already exists for this email."
          : "An account already exists for this phone number.",
      );
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

async function getCurrentUser(req, res) {
  return res.json({
    user: sanitizeUser(req.user),
  });
}

module.exports = {
  register,
  login,
  staffLogin,
  forgotPassword,
  requestOtp,
  verifyOtp,
  getCurrentUser,
};
