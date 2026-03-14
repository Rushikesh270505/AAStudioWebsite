const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected to ${env.MONGODB_URI}`);
}

module.exports = connectDB;
