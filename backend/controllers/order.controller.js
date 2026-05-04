import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const MAX_LIMIT = 100;
const parsePositiveInt = (value, fallback) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

/* ─── CREATE ORDER (works for both logged-in & guest users) ─── */
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems, shippingAddress, paymentMethod,
      itemsPrice: clientItemsPrice,
      shippingPrice: clientShippingPrice,
      totalPrice: clientTotalPrice,
      couponCode, couponDiscount,
      guestName, guestEmail,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return sendError(res, "No order items", 400);
    }

    let itemsPrice = 0;
    const formattedItems = [];

    for (const item of orderItems) {
      // Atomic stock check + decrement — prevents race condition
      const product = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) {
        // Check if product exists at all (to give a helpful error)
        const exists = await Product.findById(item.product);
        if (!exists) return sendError(res, `Product not found: ${item.product}`, 404);
        return sendError(res, `${exists.name} ka stock khatam hai`, 400);
      }

      formattedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size:  item.size  || "",
        color: item.color || "",
        image: product.images?.[0] || "",
      });

      itemsPrice += product.price * item.quantity;
    }

    const shippingPrice  = clientShippingPrice ?? 250;
    const discountAmount = couponDiscount ?? 0;
    const totalPrice     = itemsPrice + shippingPrice - discountAmount;

    const orderData = {
      orderItems: formattedItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      itemsPrice,
      shippingPrice,
      couponCode:     couponCode || "",
      couponDiscount: discountAmount,
      totalPrice,
    };

    if (req.user) {
      orderData.user = req.user._id;
    } else {
      orderData.user = null;
      orderData.guestInfo = {
        name:  guestName  || shippingAddress?.fullName || "Guest",
        email: guestEmail || "",
        phone: shippingAddress?.phone || "",
      };
    }

    const order = await Order.create(orderData);
    return sendSuccess(res, { order, orderId: order._id }, 201);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return sendError(res, "Server error while creating order");
  }
};

/* ─── USER ORDERS ─── */
export const getMyOrders = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const pages = Math.max(1, Math.ceil(total / limit));

    return sendSuccess(res, {
      orders,
      total,
      page,
      limit,
      pages,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── SINGLE ORDER ─── */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return sendError(res, "Order not found", 404);
    const isAdmin = req.user?.role === "admin";
    const isOwner = order.user && req.user && order.user._id.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return sendError(res, "Access denied", 403);
    }
    return sendSuccess(res, { order });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── ADMIN — ALL ORDERS with search/filter ─── */
export const getAllOrders = async (req, res) => {
  try {
    const { search, status } = req.query;
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), MAX_LIMIT);
    const skip = (page - 1) * limit;

    let query = {};
    if (status && status !== "all") query.orderStatus = status;
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query = {
        ...query,
        $or: [
          { "shippingAddress.fullName": regex },
          { "shippingAddress.phone": regex },
          { "guestInfo.name": regex },
          { "guestInfo.phone": regex },
          { "guestInfo.email": regex },
        ],
      };
    }

    const total = await Order.countDocuments(query);
    const pagedOrders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const pages = Math.max(1, Math.ceil(total / limit));

    return sendSuccess(res, {
      orders: pagedOrders,
      total,
      page,
      limit,
      pages,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── ADMIN — MARK PAID ─── */
export const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    await order.save();
    res.json({ success: true, message: "Payment marked as paid" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADMIN — UPDATE ORDER STATUS ─── */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const prevStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
      // Mark as paid on delivery (COD)
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "paid";
        order.paidAt = new Date();
      }
    }

    // If cancelling — restore stock
    if (status === "cancelled" && prevStatus !== "cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // If un-cancelling (re-activating) — reduce stock again
    if (prevStatus === "cancelled" && status !== "cancelled") {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product && product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }

    await order.save();
    res.json({ success: true, message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADMIN — BULK STATUS UPDATE ─── */
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    if (!orderIds?.length || !status) {
      return res.status(400).json({ success: false, message: "orderIds and status required" });
    }

    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        orderStatus: status,
        ...(status === "delivered" ? { deliveredAt: new Date(), paymentStatus: "paid", paidAt: new Date() } : {}),
      }
    );

    res.json({ success: true, message: `${orderIds.length} orders updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADMIN — DELETE ORDER ─── */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    await order.deleteOne();
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
