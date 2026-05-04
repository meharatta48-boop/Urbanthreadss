import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  getAllPages, getPageBySlug, createPage, updatePage, deletePage,
} from "../controllers/customPage.controller.js";

const router = express.Router();

router.get("/",          protect, adminOnly, getAllPages);
router.get("/:slug",     getPageBySlug);
router.post("/",         protect, adminOnly, createPage);
router.put("/:id",       protect, adminOnly, updatePage);
router.delete("/:id",    protect, adminOnly, deletePage);

export default router;
