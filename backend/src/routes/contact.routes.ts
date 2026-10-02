import { Router } from "express";
import {
  createContact,
  getContacts,
} from "../controllers/contact.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", createContact);

router.get(
  "/",
  requireAuth,
  requireAdmin,
  getContacts,
);

export default router;