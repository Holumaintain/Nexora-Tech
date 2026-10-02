import express from "express";

import {
  getTestimonials,
  createTestimonial,
} from "../controllers/testimonial.controller.js";

import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  getTestimonials,
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  createTestimonial,
);

export default router;
