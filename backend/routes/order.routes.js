import express from "express";
import {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, markOrderPaid, updateOrderStatus,
  bulkUpdateStatus, deleteOrder,
} from "../controllers/order.controller.js";

import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import {
  createOrderValidation,
  orderIdParamValidation,
  orderPaginationValidation,
  updateOrderStatusValidation,
} from "../validators/order.validators.js";

/* ── Optional auth middleware ── */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const jwt  = await import("jsonwebtoken");
      const User = (await import("../models/user.model.js")).default;
      const token   = header.split(" ")[1];
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select("-password");
      if (user) req.user = user;
    }
  } catch { /* guest */ }
  next();
};

const router = express.Router();

/* ── ADMIN ROUTES ── */
router.get("/",              protect, adminOnly, orderPaginationValidation, validateRequest, getAllOrders);
router.put("/bulk-status",   protect, adminOnly, bulkUpdateStatus);
router.put("/:id/pay",       protect, adminOnly, orderIdParamValidation, validateRequest, markOrderPaid);
router.put("/:id/status",    protect, adminOnly, updateOrderStatusValidation, validateRequest, updateOrderStatus);
router.delete("/:id",        protect, adminOnly, orderIdParamValidation, validateRequest, deleteOrder);

/* ── USER ROUTES ── */
router.post("/",      optionalAuth, createOrderValidation, validateRequest, createOrder);
router.get("/my",     protect, orderPaginationValidation, validateRequest, getMyOrders);
router.get("/:id",    protect, orderIdParamValidation, validateRequest, getOrderById);

export default router;
