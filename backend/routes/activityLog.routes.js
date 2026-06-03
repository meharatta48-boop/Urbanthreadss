import express from "express";
import { getActivityLogs, clearActivityLogs } from "../controllers/activityLog.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin Only
router.get("/", protect, adminOnly, getActivityLogs);
router.delete("/clear", protect, adminOnly, clearActivityLogs);

export default router;
