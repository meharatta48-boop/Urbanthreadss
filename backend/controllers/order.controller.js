import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ComboOffer from "../models/comboOffer.model.js";
import Coupon from "../models/coupon.model.js";
import SiteSettings from "../models/settings.model.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const MAX_LIMIT = 100;
const parsePositiveInt = (value, fallback) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const logAdminAction = async (req, action, details) => {
  try {
    if (req.user) {
      const ActivityLog = (await import("../models/activityLog.model.js")).default;
      await ActivityLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action,
        details,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      });
    }
  } catch (err) {
    console.error("Activity logging failed:", err);
  }
};

const validateCoupon = async (code, itemsPrice) => {
  if (!code) return { coupon: null, discountAmount: 0 };

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) throw new Error("Invalid or inactive coupon code");

  const now = new Date();
  if (now < coupon.startDate) throw new Error("This coupon is not active yet");
  if (now > coupon.endDate) throw new Error("This coupon has expired");

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit has been reached");
  }

  if (itemsPrice < (coupon.minOrderValue || 0)) {
    throw new Error(
      `Minimum order value of Rs. ${coupon.minOrderValue.toLocaleString()} required for this coupon`
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((itemsPrice * coupon.discountValue) / 100);
  } else {
    discountAmount = coupon.discountValue;
  }

  return { coupon, discountAmount };
};

/* ─── CREATE ORDER (works for both logged-in & guest users) ─── */
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      guestName,
      guestEmail,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return sendError(res, "No order items", 400);
    }

    const settings = await SiteSettings.findOne();
    const shippingPrice = Number(settings?.deliveryCharges ?? 250);

    let itemsPrice = 0;
    const formattedItems = [];

    for (const item of orderItems) {
      if (item.isCombo) {
        // Handle Combo Offer item
        const comboOffer = await ComboOffer.findOneAndUpdate(
          { _id: item.comboOffer, isActive: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        ).populate("products.product");

        if (!comboOffer) {
          const exists = await ComboOffer.findById(item.comboOffer);
          if (!exists) return sendError(res, `Combo offer not found: ${item.comboOffer}`, 404);
          return sendError(res, `${exists.name} stock is insufficient`, 400);
        }

        if (!item.comboItems || item.comboItems.length === 0) {
          return sendError(res, "Combo items are required inside combo order item", 400);
        }

        for (const comboSubItem of item.comboItems) {
          const product = await Product.findOneAndUpdate(
            { _id: comboSubItem.product, isActive: true, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true }
          );

          if (!product) {
            const exists = await Product.findById(comboSubItem.product);
            const pName = exists ? exists.name : comboSubItem.product;
            return sendError(res, `${pName} stock is insufficient for combo`, 400);
          }

          const fabricCost = product.fabricCost || 0;
          const printingCost = product.printingCost || 0;
          const packagingCost = product.packagingCost || 0;
          const brandingCost = product.brandingCost || 0;
          const deliveryCost = product.deliveryCost || 0;
          const adsCost = product.adsCost || 0;
          const miscCost = product.miscCost || 0;
          const unitCost = fabricCost + printingCost + packagingCost + brandingCost + deliveryCost + adsCost + miscCost;

          // Split the combo price equally among items in this combo
          const splitPrice = comboOffer.price / item.comboItems.length;

          formattedItems.push({
            product: product._id,
            name: `${comboOffer.name} - ${product.name}`,
            price: splitPrice,
            quantity: item.quantity,
            size: comboSubItem.size || "",
            color: comboSubItem.color || "",
            image: product.images?.[0] || comboOffer.images?.[0] || "",
            isCombo: true,
            comboOffer: comboOffer._id,
            comboName: comboOffer.name,
            fabricCost,
            printingCost,
            packagingCost,
            brandingCost,
            deliveryCost,
            adsCost,
            miscCost,
            unitCost,
          });
        }

        itemsPrice += comboOffer.price * item.quantity;
      } else {
        // Standard item
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

        const fabricCost = product.fabricCost || 0;
        const printingCost = product.printingCost || 0;
        const packagingCost = product.packagingCost || 0;
        const brandingCost = product.brandingCost || 0;
        const deliveryCost = product.deliveryCost || 0;
        const adsCost = product.adsCost || 0;
        const miscCost = product.miscCost || 0;
        const unitCost = fabricCost + printingCost + packagingCost + brandingCost + deliveryCost + adsCost + miscCost;

        formattedItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size:  item.size  || "",
          color: item.color || "",
          image: product.images?.[0] || "",
          fabricCost,
          printingCost,
          packagingCost,
          brandingCost,
          deliveryCost,
          adsCost,
          miscCost,
          unitCost,
        });

        itemsPrice += product.price * item.quantity;
      }
    }

    const { coupon, discountAmount } = await validateCoupon(couponCode, itemsPrice);
    const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

    const totalCost = formattedItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
    const netProfit = totalPrice - totalCost;

    const orderData = {
      orderItems: formattedItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      itemsPrice,
      shippingPrice,
      couponCode: coupon?.code || "",
      couponDiscount: discountAmount,
      totalPrice,
      totalCost,
      netProfit,
      orderTimeline: [
        {
          status: "pending",
          note: "Order placed successfully",
          updatedBy: req.user ? req.user.name : (guestName || shippingAddress?.fullName || "Guest"),
          timestamp: new Date(),
        }
      ],
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

    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
    }

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
    if (!order) return sendError(res, "Order not found", 404);
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    await order.save();
    return sendSuccess(res, { message: "Payment marked as paid", order });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── ADMIN — UPDATE ORDER STATUS ─── */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, "Order not found", 404);

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

    order.orderTimeline.push({
      status,
      note: `Status updated from "${prevStatus}" to "${status}"`,
      updatedBy: req.user?.name || "Admin",
      timestamp: new Date()
    });

    await order.save();
    await logAdminAction(req, "UPDATE_ORDER_STATUS", `Updated order #${order._id.toString().slice(-8).toUpperCase()} status to "${status}"`);
    return sendSuccess(res, { message: "Order status updated", order });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── ADMIN — BULK STATUS UPDATE ─── */
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    if (!orderIds?.length || !status) {
      return sendError(res, "orderIds and status required", 400);
    }

    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        orderStatus: status,
        ...(status === "delivered" ? { deliveredAt: new Date(), paymentStatus: "paid", paidAt: new Date() } : {}),
        $push: {
          orderTimeline: {
            status,
            note: `Status bulk updated to "${status}"`,
            updatedBy: req.user?.name || "Admin",
            timestamp: new Date()
          }
        }
      }
    );

    await logAdminAction(req, "BULK_UPDATE_ORDER_STATUS", `Bulk updated ${orderIds.length} orders to status "${status}"`);
    return sendSuccess(res, { message: `${orderIds.length} orders updated to ${status}` });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── DELETE ORDER ─── */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, "Order not found", 404);

    const isAdmin = req.user?.role === "admin";
    const isOwner = order.user && req.user && order.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return sendError(res, "Access denied", 403);
    }

    // If deleting an active order, restore product stock
    if (order.orderStatus !== "cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    const orderId = order._id.toString().slice(-8).toUpperCase();
    await order.deleteOne();
    await logAdminAction(req, "DELETE_ORDER", `Deleted order #${orderId}`);
    return sendSuccess(res, { message: "Order deleted" });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── ADMIN — UPDATE ORDER TRACKING ─── */
export const updateOrderTracking = async (req, res) => {
  try {
    const { trackingNumber, courierPartner } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courierPartner !== undefined) order.courierPartner = courierPartner;

    order.orderTimeline.push({
      status: order.orderStatus,
      note: `Tracking details updated: Courier: "${courierPartner || order.courierPartner}", Tracking ID: "${trackingNumber || order.trackingNumber}"`,
      updatedBy: req.user?.name || "Admin",
      timestamp: new Date()
    });

    await order.save();
    await logAdminAction(req, "UPDATE_ORDER_TRACKING", `Updated order #${order._id.toString().slice(-8).toUpperCase()} tracking details`);
    res.json({ success: true, message: "Tracking details updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── USER/ADMIN — REQUEST ORDER RETURN ─── */
export const requestOrderReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.returnStatus = "requested";
    order.returnReason = reason || "No reason specified";

    await order.save();
    res.json({ success: true, message: "Return requested successfully", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADMIN — UPDATE RETURN STATUS ─── */
export const updateReturnStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.returnStatus = status;

    // Restore stock if returned
    if (status === "received" || status === "approved") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderTimeline.push({
      status: order.orderStatus,
      note: `Return status updated to "${status}"`,
      updatedBy: req.user?.name || "Admin",
      timestamp: new Date()
    });

    await order.save();
    await logAdminAction(req, "UPDATE_RETURN_STATUS", `Updated order #${order._id.toString().slice(-8).toUpperCase()} return status to "${status}"`);
    res.json({ success: true, message: "Return status updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADMIN — PROCESS ORDER REFUND ─── */
export const processOrderRefund = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.refundAmount = Number(amount) || 0;
    order.returnStatus = "refunded";

    // Adjust netProfit
    order.netProfit = (order.totalPrice - order.refundAmount) - order.totalCost;

    order.orderTimeline.push({
      status: order.orderStatus,
      note: `Refund of Rs. ${amount} processed`,
      updatedBy: req.user?.name || "Admin",
      timestamp: new Date()
    });

    await order.save();
    await logAdminAction(req, "PROCESS_REFUND", `Processed refund of Rs. ${amount} for order #${order._id.toString().slice(-8).toUpperCase()}`);
    res.json({ success: true, message: "Refund processed successfully", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

