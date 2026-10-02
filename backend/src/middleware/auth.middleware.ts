import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken";

import { verifyToken } from "../utils/jwt.js";

type AuthUser = JwtPayload & {
  id: string;
  role: "user" | "admin";
};

const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  try {
    const token = header.substring(7);

    req.user = verifyToken(token);

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });

    return;
  }

  next();
};

export {
  requireAuth,
  requireAdmin,
};