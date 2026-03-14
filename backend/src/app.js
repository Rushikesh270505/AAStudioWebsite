const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const fileRoutes = require("./routes/fileRoutes");
const messageRoutes = require("./routes/messageRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = env.CLIENT_URL.split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function originMatchesPattern(origin, pattern) {
  if (!pattern.includes("*")) {
    return origin === pattern;
  }

  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const regexPattern = escapedPattern.replace(/\*/g, "[^.]+");

  return new RegExp(`^${regexPattern}$`).test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.some((pattern) => originMatchesPattern(origin, pattern))) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "aa-architecture-backend",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
