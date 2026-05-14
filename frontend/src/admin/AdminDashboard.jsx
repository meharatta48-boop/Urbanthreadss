import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  FiUsers, FiPackage, FiDollarSign, FiShoppingBag,
  FiTrendingUp, FiAlertTriangle, FiClock, FiCheckCircle,
  FiTruck, FiPlus, FiEye, FiRefreshCw, FiXCircle,
  FiArrowUp, FiArrowDown, FiBarChart2, FiArrowRight
} from "react-icons/fi";

/* ── Status config ── */
const STATUS = {
  pending:    { label: "Pending",    color: "#f59e0b" },
  processing: { label: "Packing",    color: "#c9a84c" },
  shipped:    { label: "Shipped",    color: "#818cf8" },
  delivered:  { label: "Delivered",  color: "#4ade80" },
  cancelled:  { label: "Cancelled",  color: "#f87171" },
};

/* ── Mini bar chart (pure CSS) ── */
function BarChart({ data, valueKey, labelKey, color = "#c9a84c" }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const pct = Math.round(((d[valueKey] || 0) / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm transition-all duration-700"
              style={{ height: `${Math.max(pct, 2)}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }}
              title={`${d[labelKey]}: Rs. ${(d[valueKey] || 0).toLocaleString()}`}
            />
            <span className="text-[8px] text-(--text-muted) truncate w-full text-center">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Donut chart (pure SVG) ── */
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 40, cx = 50, cy = 50, stroke = 14;
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
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke} />
        {donutSegments.map((d, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${d.dash} ${d.gap}`}
            strokeDashoffset={-d.offset * circ}
            strokeLinecap="butt"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        ))}
        <text x={cx} y={cy + 4} textAnchor="middle" fill="currentColor" className="text-(--text-primary) text-base font-bold">{total}</text>
      </svg>
      <div className="space-y-1.5 min-w-0">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-(--text-muted)">{d.label}</span>
            <span className="ml-auto font-bold" style={{ color: d.color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refresh, setRefresh]   = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [advRes, ordersRes, prodRes] = await Promise.all([
        api.get("/stats/advanced"),
        api.get("/orders"),
        api.get("/products"),
      ]);
      setData(advRes.data.data);
      setOrders((ordersRes.data.orders || []).slice(0, 8));
      const prods = prodRes.data.data || [];
      setLowStock(prods.filter((p) => p.stock <= 5).slice(0, 6));
      setRefresh(new Date());
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const hour     = new Date().getHours();
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
      sub2: " ",
      Icon: FiUsers, color: "#c084fc", bg: "rgba(192,132,252,0.12)",
      link: "/admin-dashboard/users",
    },
  ] : [];

  const donutData = data ? [
    { label: "Pending",   value: data.ordersByStatus?.pending    || 0, color: "#f59e0b" },
    { label: "Packing",   value: data.ordersByStatus?.processing || 0, color: "#c9a84c" },
    { label: "Shipped",   value: data.ordersByStatus?.shipped    || 0, color: "#818cf8" },
    { label: "Delivered", value: data.ordersByStatus?.delivered  || 0, color: "#4ade80" },
    { label: "Cancelled", value: data.ordersByStatus?.cancelled  || 0, color: "#f87171" },
  ] : [];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">{greeting} 👋</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-(--text-primary)">
            {user?.name?.split(" ")[0] || "Admin"} Dashboard
          </h2>
          <p className="text-(--text-muted) text-xs mt-1">Last updated: {refresh.toLocaleTimeString("en-PK")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin-dashboard/products/new" className="btn-gold text-sm" style={{ padding: "10px 18px", fontSize: "0.82rem" }}>
            <FiPlus size={13} /> Add Product
          </Link>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 text-xs text-(--text-muted) border border-(--border) px-3 py-2.5 rounded-xl hover:text-(--text-primary) hover:border-(--border-light) transition-all disabled:opacity-40">
            <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* PENDING BANNER */}
      {data && (data.ordersByStatus?.pending || 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-[#f59e0b]/50 to-[#c9a84c]/50 rounded-2xl blur-md opacity-30 animate-pulse pointer-events-none" />
          <div className="relative bg-linear-to-r from-[rgba(245,158,11,0.1)] to-[rgba(201,168,76,0.05)] border border-[#f59e0b]/30 rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(245,158,11,0.15)] flex items-center justify-center border border-[#f59e0b]/20 shadow-inner">
                <FiClock size={20} className="text-[#f59e0b] animate-pulse" />
              </div>
              <div>
                <p className="text-[#f59e0b] font-display font-bold text-base sm:text-lg tracking-wide flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f59e0b]"></span>
                  </span>
                  {data.ordersByStatus.pending} Pending Order{data.ordersByStatus.pending > 1 ? "s" : ""}
                </p>
                <p className="text-[#f59e0b]/70 text-xs mt-0.5 font-medium">Customer wait kar raha hai, jaldi process karein!</p>
              </div>
            </div>
            <Link to="/admin-dashboard/orders"
              className="text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
              style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
              Orders Dekho <FiArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* STAT CARDS */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 h-32 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={card.link} className="block h-full relative group">
                {/* Glow effect behind the card */}
                <div className={`absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`} style={{ background: card.color }} />
                
                <div className={`relative bg-(--bg-card) backdrop-blur-xl border rounded-2xl p-5 transition-all h-full flex flex-col justify-between ${card.urgent ? "border-[#f59e0b]/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]" : "border-(--border) hover:border-(--border-light) hover:shadow-lg"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ background: card.bg, color: card.color, border: `1px solid ${card.color}30` }}>
                      <card.Icon size={18} />
                    </div>
                    {card.urgent && (
                      <span className="text-[9px] font-bold text-[#f59e0b] bg-[rgba(245,158,11,0.15)] border border-[#f59e0b]/30 px-2 py-1 rounded-md animate-pulse shadow-sm">
                        URGENT
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-bold text-(--text-primary) tracking-tight">{card.val}</div>
                    <div className="text-(--text-muted) text-[11px] mt-1 uppercase tracking-widest font-semibold">{card.label}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-(--border-light) flex flex-col gap-1">
                    <div className="text-(--text-muted)/80 text-[10px] leading-snug">{card.sub}</div>
                    {card.sub2 && card.sub2.trim() !== "" && <div className="text-(--gold) text-[10px] font-medium leading-snug">{card.sub2}</div>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 mt-6">

        {/* WEEKLY REVENUE CHART */}
        <div className="xl:col-span-2 relative group">
          <div className="absolute -inset-0.5 bg-linear-to-br from-(--gold)/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
          <div className="relative bg-(--bg-card) border border-(--border) rounded-2xl p-6 h-full flex flex-col backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-(--text-primary) font-semibold text-sm sm:text-base flex items-center gap-2">
                <FiBarChart2 size={16} className="text-(--gold)" /> 7-Day Revenue 
                <span className="text-[10px] text-(--text-muted) font-normal border border-(--border) px-2 py-0.5 rounded-full ml-2 hidden sm:inline-block">Delivered Only</span>
              </h3>
            </div>
            <div className="flex-1">
              {data?.last7Days ? (
                <BarChart data={data.last7Days} valueKey="revenue" labelKey="date" color="var(--gold)" />
              ) : (
                <div className="h-24 bg-(--bg-elevated) rounded-xl animate-pulse" />
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-(--border-light) flex flex-wrap gap-4 sm:gap-8 text-xs text-(--text-muted)">
              <div className="flex flex-col">
                <span className="opacity-70 text-[10px] uppercase tracking-wider mb-1">Orders This Week</span>
                <span className="text-(--text-primary) font-bold text-sm">{data?.last7Days?.reduce((s, d) => s + d.orders, 0) || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="opacity-70 text-[10px] uppercase tracking-wider mb-1">Total Revenue</span>
                <span className="text-(--gold) font-bold font-display text-sm">Rs. {(data?.last7Days?.reduce((s, d) => s + d.revenue, 0) || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER STATUS DONUT */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-br from-[#4ade80]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
          <div className="relative bg-(--bg-card) border border-(--border) rounded-2xl p-6 h-full flex flex-col backdrop-blur-md">
            <h3 className="text-(--text-primary) font-semibold text-sm sm:text-base mb-6 flex items-center gap-2">
              <FiTrendingUp size={16} className="text-(--gold)" /> Order Status
            </h3>
            <div className="flex-1 flex items-center justify-center">
              {data ? <DonutChart data={donutData} /> : <div className="w-full h-32 bg-(--bg-elevated) rounded-xl animate-pulse" />}
            </div>
            {data && (
              <div className="mt-5 pt-4 border-t border-(--border-light) flex justify-between items-center text-xs text-(--text-muted)">
                <span className="uppercase tracking-widest text-[10px]">Conversion Rate</span>
                <span className="text-[#4ade80] font-bold bg-[#4ade80]/10 px-2.5 py-1 rounded-md border border-[#4ade80]/20">{data.conversionRate || 0}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MONTHLY REVENUE CHART */}
      {data?.last6Months && (
        <div className="relative group mt-6">
          <div className="absolute -inset-0.5 bg-linear-to-br from-[#818cf8]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
          <div className="relative bg-(--bg-card) border border-(--border) rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-(--text-primary) font-semibold text-sm sm:text-base mb-6 flex items-center gap-2">
              <FiTrendingUp size={16} className="text-[#818cf8]" /> 6-Month Revenue Trend 
              <span className="text-[10px] text-(--text-muted) font-normal border border-(--border) px-2 py-0.5 rounded-full ml-2 hidden sm:inline-block">Delivered Only</span>
            </h3>
            <div className="mt-4">
              <BarChart data={data.last6Months} valueKey="revenue" labelKey="month" color="#818cf8" />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 mt-6">

        {/* RECENT ORDERS */}
        <div className="xl:col-span-2 relative group">
          <div className="absolute -inset-0.5 bg-linear-to-br from-(--gold)/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
          <div className="relative bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="px-6 py-5 border-b border-(--border) flex items-center justify-between bg-(--bg-elevated)/50 backdrop-blur-md">
              <h3 className="font-display text-base sm:text-lg font-bold text-(--text-primary) flex items-center gap-2">
                <FiShoppingBag className="text-(--gold)" size={16} /> Recent Orders
              </h3>
              <Link to="/admin-dashboard/orders" className="text-xs text-(--gold) hover:text-white transition-colors bg-(--gold)/10 px-3 py-1.5 rounded-full border border-(--gold)/20 hover:bg-(--gold)/30">
                Sab dekho →
              </Link>
            </div>
            {loading ? (
              <div className="p-10 text-center text-(--text-muted) flex flex-col items-center justify-center gap-3 h-full">
                <div className="w-6 h-6 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
                <span className="text-xs tracking-widest uppercase">Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-(--text-muted) h-full flex flex-col justify-center items-center">
                <div className="w-16 h-16 rounded-full bg-(--bg-elevated) flex items-center justify-center mb-4 border border-(--border)">
                  <FiShoppingBag size={24} className="opacity-40 text-(--gold)" />
                </div>
                <p className="text-sm font-medium">Koi order nahi abhi tak</p>
                <p className="text-xs mt-1 opacity-60">Jab naye orders aayenge yahan show honge</p>
              </div>
            ) : (
              <div className="divide-y divide-(--border) flex-1">
                {orders.map((order) => {
                  const st = STATUS[order.orderStatus] || STATUS.pending;
                  return (
                    <div key={order._id} className="flex items-center justify-between px-6 py-4 hover:bg-(--bg-elevated) transition-all duration-300 group/item">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover/item:scale-110"
                          style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}30` }}>
                          <FiShoppingBag size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-(--text-primary) text-xs sm:text-sm font-semibold flex items-center gap-2">
                            <span className="opacity-50 font-normal">#</span>{order._id.slice(-8).toUpperCase()}
                            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-(--border)" />
                            <span className="text-(--text-muted) font-normal truncate">{order.user?.name || order.guestInfo?.name || "Guest"}</span>
                          </p>
                          <p className="text-(--text-muted)/70 text-[10px] sm:text-xs mt-1 font-medium tracking-wide">
                            {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            <span className="mx-2 opacity-30">|</span>
                            {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                        <span className="gold-text font-bold font-display text-sm sm:text-base">
                          Rs. {order.totalPrice?.toLocaleString()}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap"
                          style={{ color: st.color, background: `${st.color}15`, border: `1px solid ${st.color}30` }}>
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

        {/* RIGHT COLUMN */}
        <div className="space-y-5 sm:space-y-6">

          {/* TOP PRODUCTS */}
          {data?.topProducts?.length > 0 && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-br from-[#818cf8]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
              <div className="relative bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-(--border) bg-(--bg-elevated)/50 backdrop-blur-md">
                  <h3 className="text-(--text-primary) font-semibold text-sm flex items-center gap-2">
                    <FiTrendingUp size={14} className="text-[#818cf8]" /> Top Selling Items
                  </h3>
                </div>
                <div className="divide-y divide-(--border)">
                  {data.topProducts.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-(--bg-elevated) transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-(--bg-elevated) border border-(--border) flex items-center justify-center shrink-0">
                          <span className="text-(--text-muted) text-[10px] font-bold">#{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-(--text-primary) text-xs font-semibold truncate max-w-32 sm:max-w-40">{p.name}</p>
                          <p className="text-(--text-muted) text-[10px] mt-0.5 flex items-center gap-1">
                            <FiCheckCircle size={8} className="text-[#4ade80]" /> {p.qty} sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[#818cf8] text-xs font-bold block">
                          Rs. {(p.revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LOW STOCK */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-br from-[#f59e0b]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
            <div className="relative bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between bg-(--bg-elevated)/50 backdrop-blur-md">
                <h3 className="text-(--text-primary) font-semibold text-sm flex items-center gap-2">
                  <FiAlertTriangle size={14} className="text-[#f59e0b]" /> Inventory Alert
                </h3>
                {lowStock.length > 0 && (
                  <span className="text-[10px] text-[#f59e0b] font-bold bg-[#f59e0b]/10 px-2 py-1 rounded-md border border-[#f59e0b]/20">
                    {lowStock.length} items low
                  </span>
                )}
              </div>
              {lowStock.length === 0 ? (
                <div className="p-8 text-center text-(--text-muted)">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3 border border-green-500/20">
                    <FiCheckCircle size={20} className="text-green-500/60" />
                  </div>
                  <p className="text-xs font-medium text-green-500/80">Stock is perfectly maintained!</p>
                </div>
              ) : (
                <div className="divide-y divide-(--border)">
                  {lowStock.map((p) => (
                    <Link key={p._id} to={`/admin-dashboard/products/${p._id}/edit`} className="block group/item">
                      <div className="flex items-center justify-between px-5 py-3 hover:bg-(--bg-elevated) transition-all duration-300">
                        <div className="min-w-0 pr-3">
                          <p className="text-(--text-primary) text-xs font-medium truncate group-hover/item:text-(--gold) transition-colors">{p.name}</p>
                          <p className="text-(--text-muted) text-[10px] capitalize mt-0.5 opacity-70">{p.category?.name}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm shrink-0 whitespace-nowrap ${
                          p.stock === 0
                            ? "text-red-400 bg-red-900/20 border border-red-500/30 animate-pulse"
                            : "text-orange-400 bg-orange-900/20 border border-orange-500/30"
                        }`}>
                          {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} LEFT`}
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
    </div>
  );
}
