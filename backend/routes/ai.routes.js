import express from "express";
import { generateAIContent } from "../controllers/ai.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/generate", protect, adminOnly, generateAIContent);

export default router;
