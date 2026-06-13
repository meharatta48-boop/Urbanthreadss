import express from "express";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import {
  generateContent,
  supportChat,
  analyticsInsights,
  orderAnalysis
} from "../controllers/ai.controller.js";

const router = express.Router();

// Admin-only AI tools (Content Generation, Analytics, Order Analysis)
router.post("/generate",            protect, adminOnly, generateContent);
router.post("/analytics-insights",  protect, adminOnly, analyticsInsights);
router.post("/order-analysis",      protect, adminOnly, orderAnalysis);

// Public — Customer Support Chat (rate limited by nature of AI)
router.post("/chat", supportChat);

export default router;
