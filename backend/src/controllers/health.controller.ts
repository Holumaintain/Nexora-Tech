import type { Request, Response } from "express";
import mongoose from "mongoose";

const healthCheck = (_req: Request, res: Response) => {
  const database =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    success: true,
    message: "Nexora API is running",
    data: {
      environment: process.env.NODE_ENV || "development",
      database,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
};

export { healthCheck };