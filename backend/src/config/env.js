const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
  PORT: Number(process.env.PORT || 5001),
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aa_architecture_platform",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "local",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES || 10),
  OTP_DEBUG_FALLBACK: process.env.OTP_DEBUG_FALLBACK !== "false",
};

module.exports = env;
