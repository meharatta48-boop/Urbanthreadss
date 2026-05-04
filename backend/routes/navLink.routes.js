import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  getNavLinks, createNavLink, updateNavLink,
  reorderNavLinks, deleteNavLink,
} from "../controllers/navLink.controller.js";

const router = express.Router();

router.get("/",              getNavLinks);
router.post("/",             protect, adminOnly, createNavLink);
router.put("/reorder",       protect, adminOnly, reorderNavLinks);
router.put("/:id",           protect, adminOnly, updateNavLink);
router.delete("/:id",        protect, adminOnly, deleteNavLink);

export default router;
