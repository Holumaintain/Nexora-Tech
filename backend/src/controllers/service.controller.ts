import type { RequestHandler } from "express";
import { z } from "zod";
import Service from "../models/Service.js";

const serviceSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

const createSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const getServices: RequestHandler = async (_req, res) => {
  const services = await Service.find({
    active: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: services,
  });
};

const createService: RequestHandler = async (req, res) => {
  const data = serviceSchema.parse(req.body);

  const slug = data.slug || createSlug(data.title);

  const service = await Service.create({
    ...data,
    slug,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
};

export { getServices, createService };