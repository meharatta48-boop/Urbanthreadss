import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

/* ─── BASIC STATS (used by old dashboard) ─── */
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers, totalOrders, totalProducts,
      deliveredOrders, products,
      pendingCount, processingCount, shippedCount,
      deliveredCount, cancelledCount,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find({ orderStatus: "delivered" }),
      Product.find({}, "stock").lean(),
      // All status counts in one Promise.all batch
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "processing" }),
      Order.countDocuments({ orderStatus: "shipped" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
    ]);

    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    const ordersByStatus = {
      pending:    pendingCount,
      processing: processingCount,
      shipped:    shippedCount,
      delivered:  deliveredCount,
      cancelled:  cancelledCount,
    };

    const lowStock = products.filter((p) => p.stock >= 0 && p.stock <= 5).length;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,   // ← only delivered
        ordersByStatus,
        lowStock,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

/* ─── ADVANCED STATS (new dashboard charts) ─── */
export const getAdvancedStats = async (req, res) => {
  try {
    const now = new Date();

    // ── Last 7 days: daily order count + revenue ──
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end   = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();
      const dayRevenue = dayOrders
        .filter((o) => o.orderStatus === "delivered")
        .reduce((s, o) => s + (o.totalPrice || 0), 0);

      const dayLabel = start.toLocaleDateString("en-PK", { weekday: "short" });
      last7.push({ date: dayLabel, orders: dayOrders.length, revenue: dayRevenue });
    }

    // ── Last 6 months: monthly revenue ──
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthOrders = await Order.find({
        orderStatus: "delivered",
        createdAt: { $gte: start, $lte: end },
      }).lean();

      const monthRevenue = monthOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
      const monthLabel   = start.toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
      last6Months.push({ month: monthLabel, revenue: monthRevenue, orders: monthOrders.length });
    }

    // ── Top 5 selling products ──
    const allDelivered = await Order.find({ orderStatus: "delivered" }, "orderItems").lean();
    const productMap   = {};
    allDelivered.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const key = String(item.product);
        if (!productMap[key]) productMap[key] = { name: item.name, qty: 0, revenue: 0 };
        productMap[key].qty     += item.quantity;
        productMap[key].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.entries(productMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // ── Today's stats ──
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const [todayOrders, todayDelivered] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Order.find({ orderStatus: "delivered", deliveredAt: { $gte: todayStart, $lte: todayEnd } }),
    ]);
    const todayRevenue = todayDelivered.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // ── This month revenue ──
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthOrders = await Order.find({
      orderStatus: "delivered",
      createdAt: { $gte: monthStart },
    }).lean();
    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // ── Total counts ──
    const [pending, processing, shipped, delivered, cancelled, totalOrders, totalUsers] =
      await Promise.all([
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "processing" }),
        Order.countDocuments({ orderStatus: "shipped" }),
        Order.countDocuments({ orderStatus: "delivered" }),
        Order.countDocuments({ orderStatus: "cancelled" }),
        Order.countDocuments(),
        User.countDocuments(),
      ]);

    const totalRevenue = allDelivered.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const conversionRate = totalOrders > 0
      ? Math.round((delivered / totalOrders) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,       // delivered only
        thisMonthRevenue,
        todayRevenue,
        todayOrders,
        totalOrders,
        totalUsers,
        conversionRate,
        ordersByStatus: { pending, processing, shipped, delivered, cancelled },
        last7Days: last7,
        last6Months,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Advanced stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch advanced stats" });
  }
};
