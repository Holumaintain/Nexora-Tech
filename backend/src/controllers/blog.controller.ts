import type { RequestHandler } from "express";
import { z } from "zod";
import { BlogPost } from "../models/BlogPost.js";

const blogSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    category: z.string().optional(),
    readTime: z.coerce.number().int().positive().optional(),
    image: z.string().optional(),
    published: z.boolean().optional(),
    publishedAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const getPosts: RequestHandler = async (_req, res) => {
  const posts = await BlogPost.find({
    published: true,
  })
    .sort({
      publishedAt: -1,
      createdAt: -1,
    })
    .lean();

  res.json({
    success: true,
    data: posts,
  });
};

const getPostBySlug: RequestHandler = async (req, res) => {
  const post = await BlogPost.findOne({
    slug: req.params.slug,
    published: true,
  }).lean();

  if (!post) {
    res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
    return;
  }

  res.json({
    success: true,
    data: post,
  });
};

const createPost: RequestHandler = async (req, res) => {
  const data = blogSchema.parse(req.body);

  if (!data.title) {
    res.status(400).json({
      success: false,
      message: "Title is required",
    });
    return;
  }

  const slug = data.slug || createSlug(data.title);

  const post = await BlogPost.create({
    ...data,
    slug,
    publishedAt:
      data.published && !data.publishedAt
        ? new Date()
        : data.publishedAt,
  });

  res.status(201).json({
    success: true,
    message: "Blog post created successfully",
    data: post,
  });
};

const updatePost: RequestHandler = async (req, res) => {
  const data = blogSchema.parse(req.body);

  const updateData = {
    ...data,
    ...(data.title && !data.slug
      ? { slug: createSlug(data.title) }
      : {}),
  };

  if (updateData.published && !updateData.publishedAt) {
    updateData.publishedAt = new Date();
  }

  const post = await BlogPost.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!post) {
    res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
    return;
  }

  res.json({
    success: true,
    message: "Blog post updated successfully",
    data: post,
  });
};

const deletePost: RequestHandler = async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);

  if (!post) {
    res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
    return;
  }

  res.json({
    success: true,
    message: "Blog post deleted successfully",
  });
};

export {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};