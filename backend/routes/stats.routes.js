import express from "express";
import { getAdminStats, getAdvancedStats, getPublicStats, getProfitAnalytics, getBusinessGoal, updateBusinessGoal } from "../controllers/stats.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/public",  getPublicStats);
router.get("/",        protect, adminOnly, getAdminStats);
router.get("/advanced", protect, adminOnly, getAdvancedStats);
router.get("/profit-analytics", protect, adminOnly, getProfitAnalytics);
router.get("/goal", protect, adminOnly, getBusinessGoal);
router.put("/goal", protect, adminOnly, updateBusinessGoal);

export default router;
