import { Router } from "express";
import {
  register,
  login,
  getMe,
} from "../controllers/auth.controller.js";
import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  authRateLimit,
} from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimit,
  register,
);

router.post(
  "/login",
  authRateLimit,
  login,
);

router.get(
  "/me",
  requireAuth,
  getMe,
);

export default router;