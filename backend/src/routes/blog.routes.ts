import express from "express";
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/blog.controller.js";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:slug", getPostBySlug);

router.post("/", requireAuth, requireAdmin, createPost);
router.put("/:id", requireAuth, requireAdmin, updatePost);
router.delete("/:id", requireAuth, requireAdmin, deletePost);

export default router;