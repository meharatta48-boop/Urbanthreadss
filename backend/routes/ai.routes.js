import express from "express";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import { generateContent } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate", protect, adminOnly, generateContent);

export default router;
