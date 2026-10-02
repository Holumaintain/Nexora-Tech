import type { RequestHandler } from "express";
import { z } from "zod";

import { Testimonial } from "../models/Testimonial.js";

const testimonialSchema = z
  .object({
    name: z.string().min(1).optional(),
    role: z.string().optional(),
    company: z.string().optional(),
    content: z.string().min(1),
    rating: z.number().int().min(1).max(5).optional(),
    featured: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

const getTestimonials: RequestHandler = async (_req, res) => {
  const testimonials = await Testimonial.find({
    active: true,
  })
    .sort({
      featured: -1,
      createdAt: -1,
    })
    .lean();

  res.json({
    success: true,
    data: testimonials,
  });
};

const createTestimonial: RequestHandler = async (req, res) => {
  const data = testimonialSchema.parse(req.body);

  const testimonial = await Testimonial.create(data);

  res.status(201).json({
    success: true,
    message: "Testimonial created successfully",
    data: testimonial,
  });
};

export {
  getTestimonials,
  createTestimonial,
};