import { Router } from "express";
import {
  getServices,
  createService,
} from "../controllers/service.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getServices);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  createService,
);

export default router;