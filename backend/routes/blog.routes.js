import express from "express";
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from "../controllers/blog.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

// Public
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Admin
router.post("/", protect, adminOnly, createBlog);
router.put("/:id", protect, adminOnly, updateBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);

export default router;
