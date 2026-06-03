import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import SiteSettings from "../models/settings.model.js";
import BusinessGoal from "../models/businessGoal.model.js";

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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const ordersPast7Days = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    }).select("totalPrice orderStatus createdAt").lean();

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end   = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = ordersPast7Days.filter(
        (o) => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end
      );
      const dayRevenue = dayOrders
        .filter((o) => o.orderStatus === "delivered")
        .reduce((s, o) => s + (o.totalPrice || 0), 0);

      const dayLabel = start.toLocaleDateString("en-PK", { weekday: "short" });
      last7.push({ date: dayLabel, orders: dayOrders.length, revenue: dayRevenue });
    }

    // ── Last 6 months: monthly revenue ──
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      }
    ]);

    const monthlyMap = {};
    monthlyAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      monthlyMap[key] = item;
    });

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month}`;
      const entry = monthlyMap[key] || { revenue: 0, orders: 0 };
      const monthLabel = d.toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
      last6Months.push({ month: monthLabel, revenue: entry.revenue, orders: entry.orders });
    }

    // ── Top 5 selling products ──
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: "delivered" } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          qty: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const formattedTopProducts = topProducts.map((p) => ({
      id: String(p._id),
      name: p.name,
      qty: p.qty,
      revenue: p.revenue
    }));

    // ── Today's stats ──
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const [todayOrders, todayDelivered] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Order.find({ orderStatus: "delivered", deliveredAt: { $gte: todayStart, $lte: todayEnd } }).select("totalPrice").lean(),
    ]);
    const todayRevenue = todayDelivered.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // ── This month revenue ──
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthOrders = await Order.find({
      orderStatus: "delivered",
      createdAt: { $gte: monthStart },
    }).select("totalPrice").lean();
    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // ── Total counts ──
    const [pending, processing, shipped, delivered, cancelled, totalOrders, totalUsers, totalProducts] =
      await Promise.all([
        Order.countDocuments({ orderStatus: "pending" }),
        Order.countDocuments({ orderStatus: "processing" }),
        Order.countDocuments({ orderStatus: "shipped" }),
        Order.countDocuments({ orderStatus: "delivered" }),
        Order.countDocuments({ orderStatus: "cancelled" }),
        Order.countDocuments(),
        User.countDocuments(),
        Product.countDocuments(),
      ]);

    // ── New users today & this month ──
    const userTodayStart = new Date(); userTodayStart.setHours(0, 0, 0, 0);
    const userMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [newUsersToday, newUsersThisMonth] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: userTodayStart } }),
      User.countDocuments({ createdAt: { $gte: userMonthStart } }),
    ]);

    // ── Low stock count ──
    const [lowStockCount, outOfStockCount] = await Promise.all([
      Product.countDocuments({ stock: { $gte: 0, $lte: 5 } }),
      Product.countDocuments({ stock: 0 }),
    ]);

    // ── Avg order value (delivered only) ──
    const deliveredStats = await Order.aggregate([
      { $match: { orderStatus: "delivered" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);
    const totalRevenue = deliveredStats[0]?.totalRevenue || 0;
    const avgOrderValue = delivered > 0 ? Math.round(totalRevenue / delivered) : 0;

    // ── Last 30 days revenue via aggregation (single query) ──
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const raw30 = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "delivered"] }, "$totalPrice", 0],
            },
          },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    // Fill in missing days with 0
    const raw30Map = {};
    raw30.forEach((r) => {
      const key = `${r._id.y}-${String(r._id.m).padStart(2, "0")}-${String(r._id.d).padStart(2, "0")}`;
      raw30Map[key] = r;
    });

    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = raw30Map[key] || { orders: 0, revenue: 0 };
      const label = d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
      last30Days.push({ date: label, orders: entry.orders, revenue: entry.revenue });
    }

    const conversionRate = totalOrders > 0
      ? Math.round((delivered / totalOrders) * 100) : 0;
    const cancelRate = totalOrders > 0
      ? Math.round((cancelled / totalOrders) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,       // delivered only
        thisMonthRevenue,
        todayRevenue,
        todayOrders,
        totalOrders,
        totalUsers,
        totalProducts,
        conversionRate,
        cancelRate,
        avgOrderValue,
        newUsersToday,
        newUsersThisMonth,
        lowStockCount,
        outOfStockCount,
        ordersByStatus: { pending, processing, shipped, delivered, cancelled },
        last7Days: last7,
        last6Months,
        last30Days,
        topProducts: formattedTopProducts,
      },
    });
  } catch (error) {
    console.error("Advanced stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch advanced stats" });
  }
};

/* ─── PUBLIC STATS (for storefront Stats Bar) ─── */
export const getPublicStats = async (req, res) => {
  try {
    const [activeProductsCount, deliveredOrdersCount, totalUsersCount, settings] = await Promise.all([
      Product.countDocuments({ isActive: { $ne: false } }),
      Order.countDocuments({ orderStatus: "delivered" }),
      User.countDocuments(),
      SiteSettings.findOne(),
    ]);

    const deliveryCharges = settings?.deliveryCharges ?? 250;
    const happyCustomers = Math.max(deliveredOrdersCount + totalUsersCount, 500);
    const ordersCompleted = Math.max(deliveredOrdersCount, 150);

    res.status(200).json({
      success: true,
      data: {
        products: activeProductsCount,
        happyCustomers,
        delivery: deliveryCharges,
        ordersCompleted,
      },
    });
  } catch (error) {
    console.error("Public stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch public stats" });
  }
};

/* ─── PROFIT & BUSINESS INTELLIGENCE ANALYTICS ─── */
export const getProfitAnalytics = async (req, res) => {
  try {
    // 1. Fetch all products and map their current costs
    const products = await Product.find({}, "name price fabricCost printingCost packagingCost brandingCost deliveryCost adsCost miscCost stock category")
      .populate("category", "name")
      .lean();

    const productMap = {};
    products.forEach((p) => {
      const totalCost =
        (p.fabricCost || 0) +
        (p.printingCost || 0) +
        (p.packagingCost || 0) +
        (p.brandingCost || 0) +
        (p.deliveryCost || 0) +
        (p.adsCost || 0) +
        (p.miscCost || 0);

      productMap[p._id.toString()] = {
        totalCost,
        name: p.name,
      };
    });

    // 2. Fetch all orders with query projections to minimize memory payload
    const orders = await Order.find({}, "orderItems totalPrice orderStatus paymentMethod paymentStatus createdAt").lean();

    // 3. Pre-calculate sales metrics per product across all delivered orders to avoid O(N * M) loops
    const salesMap = {};
    orders.forEach((o) => {
      if (o.orderStatus === "delivered") {
        o.orderItems?.forEach((item) => {
          if (!item.product) return;
          const pId = item.product.toString();
          if (!salesMap[pId]) {
            salesMap[pId] = { qtySold: 0, revenueGenerated: 0, profitGenerated: 0 };
          }
          salesMap[pId].qtySold += item.quantity;
          salesMap[pId].revenueGenerated += item.price * item.quantity;
          
          const totalCost = productMap[pId]?.totalCost || 0;
          const uCost = (item.unitCost !== undefined && item.unitCost > 0) ? item.unitCost : totalCost;
          salesMap[pId].profitGenerated += (item.price - uCost) * item.quantity;
        });
      }
    });

    // 4. Overall Totals
    let totalRevenue = 0;
    let totalProfit = 0;
    let codPendingAmount = 0;
    let pendingOrdersCount = 0;

    orders.forEach((order) => {
      // Calculate order costs & profits
      let orderCost = 0;
      order.orderItems?.forEach((item) => {
        const uCost =
          item.unitCost !== undefined && item.unitCost > 0
            ? item.unitCost
            : (productMap[item.product?.toString()]?.totalCost || 0);
        orderCost += uCost * item.quantity;
      });

      const orderProfit = (order.totalPrice || 0) - orderCost;

      if (order.orderStatus === "delivered") {
        totalRevenue += order.totalPrice || 0;
        totalProfit += orderProfit;
      } else if (order.orderStatus !== "cancelled") {
        if (order.orderStatus === "pending") {
          pendingOrdersCount++;
        }
        if (order.paymentMethod === "COD" && order.paymentStatus === "pending") {
          codPendingAmount += order.totalPrice || 0;
        }
      }
    });

    // 5. Monthly Profit & Sales Trend (Last 6 Months)
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthOrders = orders.filter(
        (o) => o.orderStatus === "delivered" && new Date(o.createdAt) >= start && new Date(o.createdAt) <= end
      );

      const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      let monthProfit = 0;

      monthOrders.forEach((o) => {
        let oCost = 0;
        o.orderItems?.forEach((item) => {
          const uCost =
            item.unitCost !== undefined && item.unitCost > 0
              ? item.unitCost
              : (productMap[item.product?.toString()]?.totalCost || 0);
          oCost += uCost * item.quantity;
        });
        monthProfit += (o.totalPrice || 0) - oCost;
      });

      const monthLabel = start.toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
      last6Months.push({
        month: monthLabel,
        revenue: monthRevenue,
        profit: monthProfit,
        orders: monthOrders.length,
      });
    }

    // 6. Business Goal Status
    let goal = await BusinessGoal.findOne();
    if (!goal) {
      goal = await BusinessGoal.create({
        title: "Achieve 500,000 PKR profit within 6 months",
        targetProfit: 500000,
        durationMonths: 6,
        startDate: new Date(),
      });
    }

    const goalStart = new Date(goal.startDate);
    const goalOrders = orders.filter(
      (o) => o.orderStatus === "delivered" && new Date(o.createdAt) >= goalStart
    );

    let goalProfit = 0;
    goalOrders.forEach((o) => {
      let oCost = 0;
      o.orderItems?.forEach((item) => {
        const uCost =
          item.unitCost !== undefined && item.unitCost > 0
            ? item.unitCost
            : (productMap[item.product?.toString()]?.totalCost || 0);
        oCost += uCost * item.quantity;
      });
      goalProfit += (o.totalPrice || 0) - oCost;
    });

    const goalEnd = new Date(goalStart.getFullYear(), goalStart.getMonth() + goal.durationMonths, goalStart.getDate());
    const timeDiff = goalEnd.getTime() - Date.now();
    const remainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    const remainingMonths = Math.max(0, Number((remainingDays / 30).toFixed(1)));
    const remainingProfit = Math.max(0, goal.targetProfit - goalProfit);
    const monthlyRequiredProfit = remainingMonths > 0 ? Math.round(remainingProfit / remainingMonths) : remainingProfit;

    // 7. Return & Loss Tracking
    const cancelledOrders = orders.filter((o) => o.orderStatus === "cancelled");
    const cancelledCount = cancelledOrders.length;
    const lostRevenue = cancelledOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    let lostCost = 0;
    cancelledOrders.forEach((o) => {
      o.orderItems?.forEach((item) => {
        const uCost =
          item.unitCost !== undefined && item.unitCost > 0
            ? item.unitCost
            : (productMap[item.product?.toString()]?.totalCost || 0);
        lostCost += uCost * item.quantity;
      });
    });

    // 8. Product Performance Analytics (optimized lookup)
    const productStats = products.map((p) => {
      const pId = p._id.toString();
      const totalCost = productMap[pId]?.totalCost || 0;

      const sellingPrice = p.price || 0;
      const unitProfit = sellingPrice - totalCost;
      const marginPct = sellingPrice > 0 ? (unitProfit / sellingPrice) * 100 : 0;
      const roiPct = totalCost > 0 ? (unitProfit / totalCost) * 100 : 0;

      let marginStatus = "Red";
      if (marginPct >= 30) marginStatus = "Green";
      else if (marginPct >= 10) marginStatus = "Yellow";

      const sales = salesMap[pId] || { qtySold: 0, revenueGenerated: 0, profitGenerated: 0 };

      return {
        _id: p._id,
        name: p.name,
        category: p.category?.name || "General",
        stock: p.stock || 0,
        price: p.price,
        fabricCost: p.fabricCost || 0,
        printingCost: p.printingCost || 0,
        packagingCost: p.packagingCost || 0,
        brandingCost: p.brandingCost || 0,
        deliveryCost: p.deliveryCost || 0,
        adsCost: p.adsCost || 0,
        miscCost: p.miscCost || 0,
        totalCost,
        unitProfit,
        marginPct,
        roiPct,
        marginStatus,
        qtySold: sales.qtySold,
        revenueGenerated: sales.revenueGenerated,
        profitGenerated: sales.profitGenerated,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalProfit,
        codPendingAmount,
        pendingOrdersCount,
        last6Months,
        cancelledStats: {
          count: cancelledCount,
          lostRevenue,
          lostCost,
        },
        goalStatus: {
          title: goal.title,
          targetProfit: goal.targetProfit,
          durationMonths: goal.durationMonths,
          startDate: goal.startDate,
          achievedProfit: goalProfit,
          remainingProfit,
          remainingDays,
          remainingMonths,
          monthlyRequiredProfit,
          progressPct: Math.min(100, Math.round((goalProfit / goal.targetProfit) * 100) || 0),
        },
        productStats,
      },
    });
  } catch (error) {
    console.error("Profit analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to generate profit analytics" });
  }
};

/* ─── BUSINESS GOAL CRUD ─── */
export const getBusinessGoal = async (req, res) => {
  try {
    let goal = await BusinessGoal.findOne();
    if (!goal) {
      goal = await BusinessGoal.create({
        title: "Achieve 500,000 PKR profit within 6 months",
        targetProfit: 500000,
        durationMonths: 6,
        startDate: new Date(),
      });
    }
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    console.error("Get business goal error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch business goal" });
  }
};

export const updateBusinessGoal = async (req, res) => {
  try {
    const { title, targetProfit, durationMonths, startDate } = req.body;
    let goal = await BusinessGoal.findOne();
    if (!goal) {
      goal = new BusinessGoal();
    }
    if (title !== undefined) goal.title = title;
    if (targetProfit !== undefined) goal.targetProfit = Number(targetProfit) || 0;
    if (durationMonths !== undefined) goal.durationMonths = Number(durationMonths) || 1;
    if (startDate !== undefined) goal.startDate = new Date(startDate);

    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    console.error("Update business goal error:", error);
    res.status(500).json({ success: false, message: "Failed to update business goal" });
  }
};
