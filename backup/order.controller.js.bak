import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ComboOffer from "../models/comboOffer.model.js";
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

    const shippingPrice  = clientShippingPrice ?? 250;
    const discountAmount = couponDiscount ?? 0;
    const totalPrice     = itemsPrice + shippingPrice - discountAmount;

    const totalCost = formattedItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
    const netProfit = totalPrice - totalCost;

    const orderData = {
      orderItems: formattedItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      itemsPrice,
      shippingPrice,
      couponCode:     couponCode || "",
      couponDiscount: discountAmount,
      totalPrice,
      totalCost,
      netProfit,
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

    await order.save();
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
      }
    );

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

    await order.deleteOne();
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

    await order.save();
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

    await order.save();
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

    await order.save();
    res.json({ success: true, message: "Refund processed successfully", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

