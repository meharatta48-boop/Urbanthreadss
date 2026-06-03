import Coupon from "../models/coupon.model.js";

// Helper function to create activity logs
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

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, startDate, endDate, isActive, usageLimit } = req.body;
    
    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      isActive: isActive !== false,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });

    await logAdminAction(req, "CREATE_COUPON", `Created coupon code "${code.toUpperCase()}"`);

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to create coupon" });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, startDate, endDate, isActive, usageLimit } = req.body;
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (code) {
      const existing = await Coupon.findOne({ code: code.toUpperCase().trim(), _id: { $ne: coupon._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Coupon code already exists" });
      }
      coupon.code = code.toUpperCase().trim();
    }

    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue) || 0;
    if (startDate !== undefined) coupon.startDate = new Date(startDate);
    if (endDate !== undefined) coupon.endDate = new Date(endDate);
    if (isActive !== undefined) coupon.isActive = isActive;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;

    await coupon.save();
    await logAdminAction(req, "UPDATE_COUPON", `Updated coupon code "${coupon.code}"`);

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    await logAdminAction(req, "DELETE_COUPON", `Deleted coupon code "${coupon.code}"`);
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete coupon" });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return res.status(400).json({ success: false, message: "This coupon is not active yet" });
    }
    if (now > coupon.endDate) {
      return res.status(400).json({ success: false, message: "This coupon has expired" });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit has been reached" });
    }

    const total = Number(cartTotal) || 0;
    if (total < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of Rs. ${coupon.minOrderValue.toLocaleString()} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((total * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // ✅ Increment usageCount on successful validation
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully!",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to validate coupon" });
  }
};

