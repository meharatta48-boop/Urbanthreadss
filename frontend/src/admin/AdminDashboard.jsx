import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import {
  FiUsers, FiPackage, FiDollarSign, FiShoppingBag,
  FiTrendingUp, FiAlertTriangle, FiClock, FiCheckCircle,
  FiPlus, FiRefreshCw, FiBarChart2, FiCopy, FiLayers, FiCalendar
} from "react-icons/fi";

/* ── Status config ── */
const STATUS = {
  pending: { label: "Pending", color: "#f59e0b" },
  processing: { label: "Packing", color: "#c9a84c" },
  shipped: { label: "Shipped", color: "#818cf8" },
  delivered: { label: "Delivered", color: "#4ade80" },
  cancelled: { label: "Cancelled", color: "#f87171" },
};

/* ── Animation Variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

/* ── Mini bar chart (pure CSS with Gridlines) ── */
function BarChart({ data = [], valueKey, labelKey, color = "#c9a84c" }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="relative pt-4">
      {/* Background Guide Lines */}
      <div className="absolute inset-x-0 bottom-6 top-4 flex flex-col justify-between pointer-events-none opacity-5">
        <div className="border-b border-(--text-primary) w-full" />
        <div className="border-b border-(--text-primary) w-full" />
        <div className="border-b border-(--text-primary) w-full" />
      </div>

      <div className="flex items-end gap-2 h-24 relative z-10">
        {data.map((d, i) => {
          const pct = Math.round(((d[valueKey] || 0) / max) * 100);
          return (
            <div key={d[labelKey] || i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="relative w-full flex justify-center">
                {/* Tooltip */}
                <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-(--bg-elevated) border border-(--border) text-(--text-primary) text-[10px] px-1.5 py-0.5 rounded font-mono transition-transform duration-200 shadow-xl z-20 whitespace-nowrap">
                  Rs. {(d[valueKey] || 0).toLocaleString()}
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-1000 ease-out group-hover:opacity-100"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    background: color,
                    opacity: 0.75 + (i / data.length) * 0.25
                  }}
                />
              </div>
              <span className="text-[9px] text-(--text-muted) truncate w-full text-center font-medium">
                {d[labelKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Donut chart (pure SVG) ── */
function DonutChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 38, cx = 50, cy = 50, stroke = 11;
  const circ = 2 * Math.PI * r;

  const donutSegments = data.reduce((acc, d) => {
    const pct = d.value / total;
    acc.push({
      ...d,
      pct,
      dash: pct * circ,
      gap: circ - pct * circ,
      offset: acc.reduce((sum, item) => sum + item.pct, 0),
    });
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between gap-6 bg-(--bg-elevated)/30 p-4 rounded-xl border border-(--border)/40">
      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke + 1} />
          {donutSegments.map((d, i) => (
            <circle key={d.label || i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${d.dash} ${d.gap}`}
              strokeDashoffset={-d.offset * circ}
              strokeLinecap="round"
              className="transition-all duration-500 hover:opacity-80 cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-(--text-primary) text-lg font-bold font-display">{total}</span>
          <span className="text-(--text-muted) text-[9px] uppercase tracking-wider">Orders</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs group py-0.5 px-1.5 rounded-md hover:bg-(--bg-elevated) transition-colors">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: d.color }} />
            <span className="text-(--text-muted) truncate font-medium">{d.label}</span>
            <span className="ml-auto font-bold font-mono" style={{ color: d.color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState("7d"); // Custom State for filter analytics visually

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [advRes, ordersRes, prodRes] = await Promise.all([
        api.get("/stats/advanced"),
        api.get("/orders"),
        api.get("/products"),
      ]);
      setData(advRes?.data?.data || null);
      setOrders((ordersRes?.data?.orders || []).slice(0, 8));
      const prods = prodRes?.data?.data || [];
      setLowStock(prods.filter((p) => p.stock <= 5).slice(0, 6));
      setRefresh(new Date());
    } catch (e) {
      console.error("Dashboard load error:", e);
      toast.error("Dashboard data load nahi ho saka");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    toast.success(`ID #${id.slice(-8).toUpperCase()} copied!`, { autoClose: 1500 });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const cards = data ? [
    {
      label: "Total Revenue",
      val: `Rs. ${(data.totalRevenue || 0).toLocaleString()}`,
      sub: "Sirf delivered orders",
      sub2: `This month: Rs. ${(data.thisMonthRevenue || 0).toLocaleString()}`,
      Icon: FiDollarSign, color: "#c9a84c", bg: "rgba(201,168,76,0.08)",
      link: "/admin-dashboard/orders",
    },
    {
      label: "Today's Orders",
      val: data.todayOrders || 0,
      sub: `Today revenue: Rs. ${(data.todayRevenue || 0).toLocaleString()}`,
      sub2: `${data.ordersByStatus?.pending || 0} pending`,
      Icon: FiClock, color: "#f59e0b", bg: "rgba(245,158,11,0.08)",
      link: "/admin-dashboard/orders",
      urgent: (data.ordersByStatus?.pending || 0) > 0,
    },
    {
      label: "Total Orders",
      val: data.totalOrders || 0,
      sub: `${data.conversionRate || 0}% delivery rate`,
      sub2: `${data.ordersByStatus?.delivered || 0} delivered`,
      Icon: FiShoppingBag, color: "#60a5fa", bg: "rgba(96,165,250,0.12)",
      link: "/admin-dashboard/orders",
    },
    {
      label: "Total Users",
      val: data.totalUsers || 0,
      sub: "Registered customers",
      sub2: "Live tracking dashboard",
      Icon: FiUsers, color: "#c084fc", bg: "rgba(192,132,252,0.12)",
      link: "/admin-dashboard/users",
    },
  ] : [];

  const donutData = data ? [
    { label: "Pending", value: data.ordersByStatus?.pending || 0, color: "#f59e0b" },
    { label: "Packing", value: data.ordersByStatus?.processing || 0, color: "#c9a84c" },
    { label: "Shipped", value: data.ordersByStatus?.shipped || 0, color: "#818cf8" },
    { label: "Delivered", value: data.ordersByStatus?.delivered || 0, color: "#4ade80" },
    { label: "Cancelled", value: data.ordersByStatus?.cancelled || 0, color: "#f87171" },
  ] : [];

  return (
    <div className="space-y-6 max-w-400 mx-auto p-1 sm:p-4 selection:bg-(--gold) selection:text-black">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-(--bg-card) border border-(--border) p-6 rounded-2xl shadow-sm">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-(--gold) uppercase mb-0.5">{greeting} 👋</p>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary) tracking-tight">
            {user?.name?.split(" ")[0] || "Admin"} Dashboard
          </h2>
          <p className="text-(--text-muted) text-[11px] mt-1 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Last updated: {refresh.toLocaleTimeString("en-PK")}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/admin-dashboard/products/new" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-(--gold) hover:brightness-110 active:scale-95 text-black font-semibold text-xs px-4 py-3 rounded-xl shadow-md transition-all">
            <FiPlus size={14} strokeWidth={3} /> Add Product
          </Link>
          <button onClick={load} disabled={loading}
            className="flex items-center justify-center gap-2 text-xs font-medium text-(--text-muted) bg-(--bg-elevated) border border-(--border) px-4 py-3 rounded-xl hover:text-(--text-primary) hover:border-(--border-light) transition-all disabled:opacity-40">
            <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* PENDING BANNER WITH ANK-BLINK INTERACTION */}
      <AnimatePresence>
        {data && (data.ordersByStatus?.pending || 0) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }}
            className="bg-linear-to-r from-[rgba(245,158,11,0.08)] to-[rgba(245,158,11,0.02)] border border-[#f59e0b]/25 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 flex items-center justify-center shadow-inner shrink-0">
                <FiClock size={18} className="text-[#f59e0b] animate-pulse" />
              </div>
              <div>
                <p className="text-[#f59e0b] font-extrabold text-sm tracking-wide">
                  ⚡ {data.ordersByStatus.pending} Pending Order{data.ordersByStatus.pending > 1 ? "s" : ""} — Process karo!
                </p>
                <p className="text-[#f59e0b]/70 text-xs mt-0.5">Customer queue me wait kar raha hai.</p>
              </div>
            </div>
            <Link to="/admin-dashboard/orders"
              className="text-xs font-bold px-4 py-2.5 rounded-xl transition-transform active:scale-95 shadow-sm"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
              Orders Dekho →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAT CARDS SECTION */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const { label, val, sub, sub2, Icon, color, bg, link, urgent } = card;
            return (
              <motion.div key={label} variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <Link to={link} className="block h-full">
                  <div className={`bg-(--bg-card) border rounded-2xl p-5 hover:border-(--border-light) hover:shadow-md transition-all h-full relative overflow-hidden flex flex-col justify-between ${urgent ? "border-[#f59e0b]/40 shadow-[0_0_15px_rgba(245,158,11,0.03)]" : "border-(--border)"}`}>
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: bg, color }}>
                          <Icon size={19} />
                        </div>
                        {urgent && <span className="text-[8px] font-black tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/25 px-2 py-0.5 rounded-full animate-bounce">URGENT</span>}
                      </div>
                      <div className="font-display text-2xl font-black text-(--text-primary) tracking-tight font-mono">{val}</div>
                      <div className="text-(--text-muted) text-[9px] font-bold mt-1 uppercase tracking-wider">{label}</div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-(--border)/40">
                      <div className="text-(--text-muted)/70 text-[10px] truncate font-medium">{sub}</div>
                      <div className="text-(--gold) text-[10px] font-bold mt-0.5 truncate">{sub2}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* CHARTS GRAPHICAL ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* WEEKLY REVENUE CHART */}
        <div className="xl:col-span-2 bg-(--bg-card) border border-(--border) rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-(--border)/50 pb-3 mb-4">
              <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2">
                <FiBarChart2 size={15} className="text-(--gold)" /> 7-Day Revenue (Delivered Only)
              </h3>
              {/* Advance Filter Mock Interface */}
              <div className="flex bg-(--bg-elevated) p-0.5 rounded-lg border border-(--border) text-[10px] font-bold">
                {["7d", "30d", "1y"].map((t) => (
                  <button key={t} onClick={() => setTimeRange(t)} className={`px-2 py-1 rounded-md uppercase transition-all ${timeRange === t ? "bg-(--gold) text-black" : "text-(--text-muted)"}`}>{t}</button>
                ))}
              </div>
            </div>
            {data?.last7Days ? (
              <BarChart data={data.last7Days} valueKey="revenue" labelKey="date" color="var(--gold)" />
            ) : (
              <div className="h-24 bg-(--bg-elevated) rounded-xl animate-pulse" />
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-(--border)/40 flex items-center justify-between text-xs text-(--text-muted) font-medium font-mono">
            <span>Orders: <span className="text-(--text-primary) font-bold">{data?.last7Days?.reduce((s, d) => s + d.orders, 0) || 0} items</span></span>
            <span>Total: <span className="text-(--gold) font-black">Rs. {(data?.last7Days?.reduce((s, d) => s + d.revenue, 0) || 0).toLocaleString()}</span></span>
          </div>
        </div>

        {/* ORDER STATUS DONUT */}
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-(--text-primary) font-bold text-sm mb-4 flex items-center gap-2 border-b border-(--border)/50 pb-3">
              <FiLayers size={14} className="text-(--gold)" /> Order Lifecycle Distribution
            </h3>
            {data ? <DonutChart data={donutData} /> : <div className="h-28 bg-(--bg-elevated) rounded-xl animate-pulse" />}
          </div>
          {data && (
            <div className="mt-3 pt-3 border-t border-(--border)/40 flex items-center justify-between text-xs text-(--text-muted)">
              <span>Overall Delivery Rate:</span>
              <span className="text-[#4ade80] font-black font-mono bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded-md">{data.conversionRate || 0}%</span>
            </div>
          )}
        </div>
      </div>

      {/* MONTHLY REVENUE CHART */}
      {data?.last6Months && (
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
          <h3 className="text-(--text-primary) font-bold text-sm mb-4 flex items-center gap-2 border-b border-(--border)/50 pb-3">
            <FiTrendingUp size={15} className="text-[#818cf8]" /> 6-Month Revenue Trend Analytics
          </h3>
          <BarChart data={data.last6Months} valueKey="revenue" labelKey="month" color="#818cf8" />
        </div>
      )}

      {/* BOTTOM ACTIONABLE TABLES ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* RECENT ORDERS COMPONENT */}
        <div className="xl:col-span-2 bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between bg-(--bg-elevated)/10">
              <h3 className="font-display text-sm font-bold text-(--text-primary) flex items-center gap-2">
                <FiShoppingBag className="text-(--gold)" size={15} /> Recent Dynamic Orders
              </h3>
              <Link to="/admin-dashboard/orders" className="text-[11px] font-bold text-(--text-muted) hover:text-(--gold) transition-colors">
                Sab dekho →
              </Link>
            </div>
            {loading ? (
              <div className="p-12 text-center text-(--text-muted) flex items-center justify-center gap-2 font-medium text-xs">
                <div className="w-4 h-4 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
                Loading logs...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-(--text-muted)">
                <FiShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">Koi order nahi mila abhi tak</p>
              </div>
            ) : (
              <div className="divide-y divide-(--border)/50">
                {orders.map((order) => {
                  const st = STATUS[order.orderStatus] || STATUS.pending;
                  return (
                    <div key={order._id} className="flex items-center justify-between px-5 py-3 hover:bg-(--bg-elevated)/40 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-(--border)/20"
                          style={{ background: `${st.color}10`, color: st.color }}>
                          <FiShoppingBag size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyToClipboard(order._id)}
                              className="text-(--text-primary) text-xs font-bold font-mono hover:text-(--gold) flex items-center gap-1 group/btn"
                              title="Click to copy ID"
                            >
                              #{order._id.slice(-8).toUpperCase()}
                              <FiCopy size={10} className="opacity-0 group-hover/btn:opacity-100 text-(--text-muted)" />
                            </button>
                            <span className="text-(--text-muted) text-xs truncate max-w-27.5">
                              · {order.user?.name || order.guestInfo?.name || "Guest"}
                            </span>
                          </div>
                          <p className="text-(--text-muted)/60 text-[10px] mt-0.5 font-medium flex items-center gap-1">
                            <FiCalendar size={10} />
                            {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                            <span>· {order.orderItems?.length || 0} items</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-(--text-primary) font-black font-mono text-xs hidden sm:block">
                          Rs. {order.totalPrice?.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-inner"
                          style={{ color: st.color, background: `${st.color}10`, borderColor: `${st.color}25` }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-5">

          {/* TOP SELLING PRODUCTS */}
          {data?.topProducts?.length > 0 && (
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-(--border) bg-(--bg-elevated)/10">
                <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2">
                  <FiTrendingUp size={14} className="text-(--gold)" /> Top Performing Products
                </h3>
              </div>
              <div className="divide-y divide-(--border)/50">
                {data.topProducts.map((p, i) => (
                  <div key={p.id || i} className="flex items-center justify-between px-5 py-3.5 hover:bg-(--bg-elevated)/40 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-(--text-muted) text-[11px] font-black w-5 font-mono">0{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-(--text-primary) text-xs font-semibold truncate max-w-35">{p.name}</p>
                        <p className="text-(--text-muted) text-[10px] font-mono mt-0.5">{p.qty} items units sold</p>
                      </div>
                    </div>
                    <span className="text-(--gold) text-xs font-black font-mono bg-(--gold)/5 border border-(--gold)/10 px-2 py-0.5 rounded-md">
                      Rs. {(p.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRITICAL LOW STOCK MONITOR */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between bg-(--bg-elevated)/10">
              <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2">
                <FiAlertTriangle size={14} className="text-[#f59e0b]" /> Inventory Stock Tracker
              </h3>
              <span className="text-[10px] text-[#f59e0b] font-black bg-[#f59e0b]/10 px-2 py-0.5 rounded-md border border-[#f59e0b]/20 font-mono">{lowStock.length} Alerts</span>
            </div>
            {lowStock.length === 0 ? (
              <div className="p-8 text-center text-(--text-muted)">
                <FiCheckCircle size={26} className="mx-auto mb-2 text-green-400 opacity-60" />
                <p className="text-xs font-medium">Sab stock absolutely perfect hai 👍</p>
              </div>
            ) : (
              <div className="divide-y divide-(--border)/50">
                {lowStock.map((p) => (
                  <Link key={p._id} to={`/admin-dashboard/products/${p._id}/edit`} className="block">
                    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-(--bg-elevated)/40 transition-colors group">
                      <div className="min-w-0">
                        <p className="text-(--text-primary) text-xs font-medium truncate max-w-37.5 group-hover:text-(--gold) transition-colors">{p.name}</p>
                        <p className="text-(--text-muted) text-[10px] capitalize mt-0.5 font-mono">{p.category?.name || "General"}</p>
                      </div>
                      <span className={`text-[10px] font-black font-mono px-2 py-1 rounded-lg border ${p.stock === 0
                          ? "text-red-400 bg-red-950/20 border-red-900/30 shadow-sm"
                          : "text-orange-400 bg-orange-950/20 border-orange-900/30 shadow-sm"
                        }`}>
                        {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} Left`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}