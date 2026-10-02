import { z } from "zod";

const serviceSchema = z.object({
  title: z.string().trim().min(2).max(160),

  slug: z.string().trim().min(2).max(180).optional(),

  description: z.string().trim().min(5).max(2000),

  icon: z.string().trim().max(120).optional(),

  featured: z.boolean().optional(),

  active: z.boolean().optional(),
});

const testimonialSchema = z.object({
  quote: z.string().trim().min(5).max(3000),

  name: z.string().trim().min(2).max(120),

  role: z.string().trim().min(2).max(160),

  category: z.string().trim().min(2).max(100),

  image: z.string().trim().max(500).optional(),

  featured: z.boolean().optional(),

  active: z.boolean().optional(),
});

const blogSchema = z.object({
  title: z.string().trim().min(2).max(220),

  slug: z.string().trim().min(2).max(220).optional(),

  excerpt: z.string().trim().min(5).max(1000),

  content: z.string().min(10),

  category: z.string().trim().min(2).max(100),

  readTime: z.coerce.number().int().positive(),

  image: z.string().trim().max(500).optional(),

  published: z.boolean().optional(),

  publishedAt: z.coerce.date().optional(),
});

export {
  serviceSchema,
  testimonialSchema,
  blogSchema,
};