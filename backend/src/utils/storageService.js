const fs = require("fs/promises");
const path = require("path");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
const { v2: cloudinary } = require("cloudinary");
const env = require("../config/env");

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const s3Client =
  env.STORAGE_PROVIDER === "s3" && env.AWS_REGION
    ? new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

async function uploadToLocal(file) {
  const extension = path.extname(file.originalname) || "";
  const key = `${uuid()}${extension}`;
  const uploadsDir = path.join(process.cwd(), "uploads");

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, key), file.buffer);

  return {
    url: `${env.SERVER_URL}/uploads/${key}`,
    key,
    storageProvider: "local",
  };
}

async function uploadToS3(file) {
  if (!s3Client || !env.AWS_S3_BUCKET) {
    throw new Error("S3 is not configured.");
  }

  const extension = path.extname(file.originalname) || "";
  const key = `${uuid()}${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return {
    url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
    key,
    storageProvider: "s3",
  };
}

async function uploadToCloudinary(file) {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary is not configured.");
  }

  const uploadResult = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder: "aa-architecture-platform",
      resource_type: "auto",
    },
  );

  return {
    url: uploadResult.secure_url,
    key: uploadResult.public_id,
    storageProvider: "cloudinary",
  };
}

async function uploadBuffer(file) {
  if (env.STORAGE_PROVIDER === "cloudinary") {
    return uploadToCloudinary(file);
  }

  if (env.STORAGE_PROVIDER === "s3") {
    return uploadToS3(file);
  }

  return uploadToLocal(file);
}

module.exports = {
  uploadBuffer,
};
