import { sendCartAddEmail } from "../services/email.service.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

/* ── POST /api/notifications/cart-add ── */
export const cartAddNotification = async (req, res) => {
  try {
    const { product } = req.body;

    if (!product || !product.name || !product.price) {
      return sendError(res, "Product details are required", 400);
    }

    // Fire and forget — do not block the response
    sendCartAddEmail({
      product,
      user: req.user || null, // Optional auth — null for guests
    }).catch((err) =>
      console.error("[NOTIFICATION] Cart email dispatch failed:", err.message)
    );

    return sendSuccess(res, { message: "Notification queued" }, 200);
  } catch (error) {
    // Never crash the client — just log and return 200
    console.error("[NOTIFICATION] cartAddNotification error:", error.message);
    return sendSuccess(res, { message: "Notification skipped" }, 200);
  }
};
