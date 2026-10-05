import dns from "node:dns";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

async function startServer() {
  try {
    await connectDB();

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(
        `Nexora API running at http://localhost:${env.PORT}`,
      );

      console.log(
        `Environment: ${env.NODE_ENV}`,
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error,
    );

    process.exit(1);
  }
}

startServer();