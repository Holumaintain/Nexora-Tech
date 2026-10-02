import { Router } from "express";
import {
  subscribe,
  getSubscribers,
} from "../controllers/newsletter.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/subscribe", subscribe);

router.get(
  "/",
  requireAuth,
  requireAdmin,
  getSubscribers,
);

export default router;