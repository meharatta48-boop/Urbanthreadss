import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  FiUsers, FiPackage, FiDollarSign, FiShoppingBag,
  FiTrendingUp, FiAlertTriangle, FiClock, FiCheckCircle,
  FiTruck, FiPlus, FiEye, FiRefreshCw, FiXCircle,
  FiArrowUp, FiArrowDown, FiBarChart2
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
            <span className="text-[8px] text-[#333] truncate w-full text-center">{d[labelKey]}</span>
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
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#111" strokeWidth={stroke} />
        {donutSegments.map((d, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${d.dash} ${d.gap}`}
            strokeDashoffset={-d.offset * circ}
            strokeLinecap="butt"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        ))}
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">{total}</text>
      </svg>
      <div className="space-y-1.5 min-w-0">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[#555]">{d.label}</span>
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
      Icon: FiShoppingBag, color: "#60a5fa", bg: "rgba(96,165,250,0.08)",
      link: "/admin-dashboard/orders",
    },
    {
      label: "Total Users",
      val: data.totalUsers || 0,
      sub: "Registered customers",
      sub2: " ",
      Icon: FiUsers, color: "#c084fc", bg: "rgba(192,132,252,0.08)",
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
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {user?.name?.split(" ")[0] || "Admin"} Dashboard
          </h2>
          <p className="text-[#333] text-xs mt-1">Last updated: {refresh.toLocaleTimeString("en-PK")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin-dashboard/products/new" className="btn-gold text-sm" style={{ padding: "10px 18px", fontSize: "0.82rem" }}>
            <FiPlus size={13} /> Add Product
          </Link>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 text-xs text-[#555] border border-[#1a1a1a] px-3 py-2.5 rounded-xl hover:text-white hover:border-[#333] transition-all disabled:opacity-40">
            <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* PENDING BANNER */}
      {data && (data.ordersByStatus?.pending || 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[rgba(245,158,11,0.06)] border border-[#f59e0b]/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(245,158,11,0.12)] flex items-center justify-center">
              <FiClock size={16} className="text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-[#f59e0b] font-bold text-sm">
                ⚡ {data.ordersByStatus.pending} Pending Order{data.ordersByStatus.pending > 1 ? "s" : ""} — Process karo!
              </p>
              <p className="text-[#f59e0b]/50 text-xs">Customer wait kar raha hai</p>
            </div>
          </div>
          <Link to="/admin-dashboard/orders"
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
            Orders Dekho →
          </Link>
        </motion.div>
      )}

      {/* STAT CARDS */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0c0c0c] border border-[#111] rounded-2xl p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, val, sub, sub2, Icon, color, bg, link, urgent }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={link} className="block">
                <div className={`bg-[#0c0c0c] border rounded-2xl p-5 hover:border-[#333] transition-all group h-full ${urgent ? "border-[#f59e0b]/30" : "border-[#111]"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
                      <Icon size={17} />
                    </div>
                    {urgent && <span className="text-[9px] font-bold text-[#f59e0b] bg-[rgba(245,158,11,0.1)] border border-[#f59e0b]/20 px-1.5 py-0.5 rounded">URGENT</span>}
                  </div>
                  <div className="font-display text-xl sm:text-2xl font-bold text-white">{val}</div>
                  <div className="text-[#444] text-[10px] mt-1 uppercase tracking-wider">{label}</div>
                  <div className="text-[#333] text-[10px] mt-0.5">{sub}</div>
                  <div className="text-[#c9a84c] text-[10px] mt-0.5">{sub2}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* WEEKLY REVENUE CHART */}
        <div className="xl:col-span-2 bg-[#0c0c0c] border border-[#111] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <FiBarChart2 size={14} className="text-[#c9a84c]" /> 7-Day Revenue (Delivered)
            </h3>
          </div>
          {data?.last7Days ? (
            <BarChart data={data.last7Days} valueKey="revenue" labelKey="date" color="#c9a84c" />
          ) : (
            <div className="h-20 bg-[#111] rounded-xl animate-pulse" />
          )}
          <div className="mt-3 flex gap-4 text-xs text-[#444]">
            <span>Orders this week: <span className="text-white font-bold">{data?.last7Days?.reduce((s, d) => s + d.orders, 0) || 0}</span></span>
            <span>Revenue: <span className="text-[#c9a84c] font-bold">Rs. {(data?.last7Days?.reduce((s, d) => s + d.revenue, 0) || 0).toLocaleString()}</span></span>
          </div>
        </div>

        {/* ORDER STATUS DONUT */}
        <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <FiTrendingUp size={14} className="text-[#c9a84c]" /> Order Status
          </h3>
          {data ? <DonutChart data={donutData} /> : <div className="h-24 bg-[#111] rounded-xl animate-pulse" />}
          {data && (
            <div className="mt-3 pt-3 border-t border-[#111] text-xs text-[#444]">
              Conversion rate: <span className="text-[#4ade80] font-bold">{data.conversionRate || 0}%</span>
            </div>
          )}
        </div>
      </div>

      {/* MONTHLY REVENUE CHART */}
      {data?.last6Months && (
        <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <FiTrendingUp size={14} className="text-[#c9a84c]" /> 6-Month Revenue Trend (Delivered Orders Only)
          </h3>
          <BarChart data={data.last6Months} valueKey="revenue" labelKey="month" color="#818cf8" />
        </div>
      )}

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* RECENT ORDERS */}
        <div className="xl:col-span-2 bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#111] flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <FiShoppingBag className="text-[#c9a84c]" size={15} /> Recent Orders
            </h3>
            <Link to="/admin-dashboard/orders" className="text-xs text-[#555] hover:text-[#c9a84c] transition-colors">
              Sab dekho →
            </Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-[#333] flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-[#333]">
              <FiShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Koi order nahi abhi tak</p>
            </div>
          ) : (
            <div className="divide-y divide-[#111]">
              {orders.map((order) => {
                const st = STATUS[order.orderStatus] || STATUS.pending;
                return (
                  <div key={order._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#111] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${st.color}15`, color: st.color }}>
                        <FiShoppingBag size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                          {" "}<span className="text-[#555] font-normal">{order.user?.name || order.guestInfo?.name || "Guest"}</span>
                        </p>
                        <p className="text-[#333] text-[10px] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                          {" · "}{order.orderItems?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="gold-text font-bold font-display text-sm hidden sm:block">
                        Rs. {order.totalPrice?.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
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

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* TOP PRODUCTS */}
          {data?.topProducts?.length > 0 && (
            <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#111]">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <FiTrendingUp size={13} className="text-[#c9a84c]" /> Top Selling
                </h3>
              </div>
              <div className="divide-y divide-[#111]">
                {data.topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#111] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[#333] text-xs font-bold w-5 flex-shrink-0">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate max-w-[130px]">{p.name}</p>
                        <p className="text-[#444] text-[10px]">{p.qty} sold</p>
                      </div>
                    </div>
                    <span className="text-[#c9a84c] text-xs font-bold whitespace-nowrap">
                      Rs. {(p.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOW STOCK */}
          <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#111] flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <FiAlertTriangle size={13} className="text-[#f59e0b]" /> Low Stock
              </h3>
              <span className="text-xs text-[#f59e0b] font-bold">{lowStock.length} items</span>
            </div>
            {lowStock.length === 0 ? (
              <div className="p-6 text-center text-[#333]">
                <FiCheckCircle size={24} className="mx-auto mb-2 text-green-600/40" />
                <p className="text-xs">Sab stock theek hai 👍</p>
              </div>
            ) : (
              <div className="divide-y divide-[#111]">
                {lowStock.map((p) => (
                  <Link key={p._id} to={`/admin-dashboard/products/${p._id}/edit`}>
                    <div className="flex items-center justify-between px-5 py-3 hover:bg-[#111] transition-colors">
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate max-w-[140px]">{p.name}</p>
                        <p className="text-[#444] text-[10px] capitalize">{p.category?.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        p.stock === 0
                          ? "text-red-400 bg-red-900/15 border border-red-900/20"
                          : "text-orange-400 bg-orange-900/15 border border-orange-900/20"
                      }`}>
                        {p.stock === 0 ? "OUT!" : `${p.stock} left`}
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
