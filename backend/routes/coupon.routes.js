import express from "express";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

// Public / Authenticated check
router.post("/validate", validateCoupon);

// Admin Only CRUD
router.get("/", protect, adminOnly, getCoupons);
router.post("/", protect, adminOnly, createCoupon);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

export default router;
