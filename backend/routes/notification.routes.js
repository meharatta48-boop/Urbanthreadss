import express from "express";
import { cartAddNotification } from "../controllers/notification.controller.js";

// Optional auth middleware (inline — guests allowed)
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

// POST /api/notifications/cart-add
router.post("/cart-add", optionalAuth, cartAddNotification);

export default router;
