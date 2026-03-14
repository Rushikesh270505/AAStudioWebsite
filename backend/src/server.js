const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const User = require("./models/User");
const { ensureDefaultAdminAccounts } = require("./utils/adminAccounts");

async function startServer() {
  try {
    await connectDB();
    await ensureDefaultAdminAccounts(User);

    app.listen(env.PORT, () => {
      console.log(`Backend server running on ${env.SERVER_URL}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
