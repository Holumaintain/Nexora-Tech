import mongoose from "mongoose";

import { env } from "../config/env.js";

const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);

  console.log("MongoDB connected successfully");
};

const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();

  console.log("MongoDB disconnected");
};

export {
  connectDB,
  disconnectDB,
};