import express from "express";
import { getAdminStats, getAdvancedStats, getPublicStats } from "../controllers/stats.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/public",  getPublicStats);
router.get("/",        protect, adminOnly, getAdminStats);
router.get("/advanced", protect, adminOnly, getAdvancedStats);

export default router;
