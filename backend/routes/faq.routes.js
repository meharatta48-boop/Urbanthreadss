import express from "express";
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from "../controllers/faq.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

// Public
router.get("/", getFAQs);

// Admin
router.post("/", protect, adminOnly, createFAQ);
router.put("/:id", protect, adminOnly, updateFAQ);
router.delete("/:id", protect, adminOnly, deleteFAQ);

export default router;
