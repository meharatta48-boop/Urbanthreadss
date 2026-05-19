import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag,
  FiUsers, FiPackage, FiRefreshCw, FiBarChart2, FiPieChart,
  FiActivity, FiTarget, FiAward, FiAlertTriangle
} from "react-icons/fi";

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } }
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };

/* ── Sparkline (mini line chart SVG) ── */
function Sparkline({ data = [], color = "#c9a84c", height = 40 }) {
  if (!data.length) return null;
  const vals = data.map((d) => d.revenue || 0);
  const max = Math.max(...vals, 1);
  const w = 120, h = height;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" points={pts} />
      <polyline fill={`${color}18`}
        points={`0,${h} ${pts} ${w},${h}`} strokeWidth="0" />
    </svg>
  );
}

/* ── Bar Chart ── */
function BarChart({ data = [], valueKey, labelKey, color = "#c9a84c", showEvery = 1 }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="relative pt-2">
      <div className="flex items-end gap-1 h-32 relative z-10">
        {data.map((d, i) => {
          const pct = Math.round(((d[valueKey] || 0) / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-(--bg-elevated) border border-(--border) text-(--text-primary) text-[10px] px-1.5 py-0.5 rounded font-mono transition-transform z-20 whitespace-nowrap shadow-xl">
                  Rs. {(d[valueKey] || 0).toLocaleString()}
                </span>
                <div className="w-full rounded-t transition-all duration-700 ease-out"
                  style={{ height: `${Math.max(pct, 3)}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
              </div>
              {i % showEvery === 0 && (
                <span className="text-[8px] text-(--text-muted) truncate w-full text-center font-medium">{d[labelKey]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Donut Chart ── */
function DonutChart({ data = [], size = 110 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 38, cx = 50, cy = 50, stroke = 12;
  const circ = 2 * Math.PI * r;
  const segments = data.reduce((acc, d) => {
    const pct = d.value / total;
    acc.push({ ...d, pct, dash: pct * circ, gap: circ - pct * circ, offset: acc.reduce((s, x) => s + x.pct, 0) });
    return acc;
  }, []);
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke + 1} />
          {segments.map((d, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${d.dash} ${d.gap}`}
              strokeDashoffset={-d.offset * circ}
              strokeLinecap="round"
              className="transition-all duration-500" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-(--text-primary) text-lg font-black font-mono">{total}</span>
          <span className="text-(--text-muted) text-[9px] uppercase">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-(--text-muted) flex-1 font-medium">{d.label}</span>
            <span className="font-black font-mono" style={{ color: d.color }}>{d.value}</span>
            <span className="text-(--text-muted)/50 text-[9px] font-mono w-8 text-right">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, Icon, color, bg, trend, trendVal }) {
  return (
    <motion.div variants={fadeUp}
      className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 hover:border-(--border-light) hover:shadow-lg transition-all group"
      whileHover={{ y: -3, transition: { duration: 0.18 } }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: bg, color }}>
          <Icon size={17} />
        </div>
        {trendVal !== undefined && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${trend === "up"
            ? "text-emerald-400 bg-emerald-950/30 border-emerald-800/30"
            : "text-red-400 bg-red-950/30 border-red-800/30"}`}>
            {trend === "up" ? <FiTrendingUp size={9} /> : <FiTrendingDown size={9} />}
            {trendVal}
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-black text-(--text-primary) font-mono tracking-tight">{value}</div>
      <div className="text-(--text-muted) text-[9px] font-bold uppercase tracking-wider mt-0.5">{label}</div>
      {sub && <div className="text-(--text-muted)/60 text-[10px] mt-2 font-medium">{sub}</div>}
    </motion.div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState("revenue"); // "revenue" | "orders"
  const [timeRange, setTimeRange] = useState("30d");     // "7d" | "30d" | "6m"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/stats/advanced");
      setData(res?.data?.data || null);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Chart data based on selected range */
  const chartData = data
    ? timeRange === "7d" ? data.last7Days
    : timeRange === "30d" ? (data.last30Days || data.last7Days)
    : data.last6Months
    : [];

  const chartLabelKey = timeRange === "6m" ? "month" : "date";
  const showEvery = timeRange === "30d" ? 5 : 1;

  const donutData = data ? [
    { label: "Pending",   value: data.ordersByStatus?.pending    || 0, color: "#f59e0b" },
    { label: "Packing",   value: data.ordersByStatus?.processing || 0, color: "#c9a84c" },
    { label: "Shipped",   value: data.ordersByStatus?.shipped    || 0, color: "#818cf8" },
    { label: "Delivered", value: data.ordersByStatus?.delivered  || 0, color: "#4ade80" },
    { label: "Cancelled", value: data.ordersByStatus?.cancelled  || 0, color: "#f87171" },
  ] : [];

  /* Revenue growth vs last period */
  const revenueGrowth = data?.last7Days ? (() => {
    const d = data.last7Days;
    const half = Math.floor(d.length / 2);
    const first = d.slice(0, half).reduce((s, x) => s + x.revenue, 0);
    const second = d.slice(half).reduce((s, x) => s + x.revenue, 0);
    if (!first) return null;
    return Math.round(((second - first) / first) * 100);
  })() : null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-20 bg-(--bg-card) rounded-2xl animate-pulse border border-(--border)" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-(--bg-card) rounded-2xl animate-pulse border border-(--border)" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="h-56 bg-(--bg-card) rounded-2xl animate-pulse border border-(--border)" />
          <div className="h-56 bg-(--bg-card) rounded-2xl animate-pulse border border-(--border)" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-400 mx-auto p-1 sm:p-4">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-(--bg-card) border border-(--border) p-6 rounded-2xl shadow-sm">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-(--gold) uppercase mb-0.5">📊 Business Intelligence</p>
          <h2 className="font-display text-2xl font-black text-(--text-primary)">Analytics Overview</h2>
          <p className="text-(--text-muted) text-xs mt-1">Revenue trends, order flow, and customer insights</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-xs font-medium text-(--text-muted) bg-(--bg-elevated) border border-(--border) px-4 py-2.5 rounded-xl hover:text-(--text-primary) transition-all">
          <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI CARDS */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" Icon={FiDollarSign} color="#c9a84c" bg="rgba(201,168,76,0.1)"
          value={`Rs. ${(data?.totalRevenue || 0).toLocaleString()}`}
          sub={`This month: Rs. ${(data?.thisMonthRevenue || 0).toLocaleString()}`}
          trend={revenueGrowth >= 0 ? "up" : "down"}
          trendVal={revenueGrowth !== null ? `${Math.abs(revenueGrowth)}%` : undefined} />
        <KpiCard label="Avg Order Value" Icon={FiTarget} color="#818cf8" bg="rgba(129,140,248,0.1)"
          value={`Rs. ${(data?.avgOrderValue || 0).toLocaleString()}`}
          sub={`Delivery rate: ${data?.conversionRate || 0}%`} />
        <KpiCard label="Total Products" Icon={FiPackage} color="#34d399" bg="rgba(52,211,153,0.1)"
          value={data?.totalProducts || 0}
          sub={`${data?.lowStockCount || 0} low stock alerts`}
          trend={(data?.lowStockCount || 0) > 0 ? "down" : "up"}
          trendVal={(data?.lowStockCount || 0) > 0 ? `${data.lowStockCount} alerts` : "All clear"} />
        <KpiCard label="Total Customers" Icon={FiUsers} color="#c084fc" bg="rgba(192,132,252,0.1)"
          value={data?.totalUsers || 0}
          sub={`${data?.newUsersToday || 0} new today`}
          trend={data?.newUsersToday > 0 ? "up" : "up"}
          trendVal={`+${data?.newUsersThisMonth || 0} this month`} />
        <KpiCard label="Total Orders" Icon={FiShoppingBag} color="#60a5fa" bg="rgba(96,165,250,0.1)"
          value={data?.totalOrders || 0}
          sub={`${data?.ordersByStatus?.pending || 0} pending`} />
        <KpiCard label="Delivered" Icon={FiAward} color="#4ade80" bg="rgba(74,222,128,0.1)"
          value={data?.ordersByStatus?.delivered || 0}
          sub={`${data?.conversionRate || 0}% success rate`}
          trend="up" trendVal={`${data?.conversionRate || 0}%`} />
        <KpiCard label="Cancelled" Icon={FiAlertTriangle} color="#f87171" bg="rgba(248,113,113,0.1)"
          value={data?.ordersByStatus?.cancelled || 0}
          sub={`Cancel rate: ${data?.cancelRate || 0}%`}
          trend={(data?.cancelRate || 0) > 10 ? "down" : "up"}
          trendVal={`${data?.cancelRate || 0}%`} />
        <KpiCard label="Today's Orders" Icon={FiActivity} color="#f59e0b" bg="rgba(245,158,11,0.1)"
          value={data?.todayOrders || 0}
          sub={`Revenue: Rs. ${(data?.todayRevenue || 0).toLocaleString()}`} />
      </motion.div>

      {/* MAIN CHART */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--border)/50 pb-4 mb-5">
          <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2">
            <FiBarChart2 size={15} className="text-(--gold)" />
            Revenue & Orders Trend
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode toggle */}
            <div className="flex bg-(--bg-elevated) p-0.5 rounded-lg border border-(--border) text-[10px] font-bold">
              {[["revenue", "Revenue"], ["orders", "Orders"]].map(([m, l]) => (
                <button key={m} onClick={() => setChartMode(m)}
                  className={`px-3 py-1 rounded-md transition-all ${chartMode === m ? "bg-(--gold) text-black" : "text-(--text-muted)"}`}>
                  {l}
                </button>
              ))}
            </div>
            {/* Range toggle */}
            <div className="flex bg-(--bg-elevated) p-0.5 rounded-lg border border-(--border) text-[10px] font-bold">
              {[["7d", "7D"], ["30d", "30D"], ["6m", "6M"]].map(([t, l]) => (
                <button key={t} onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1 rounded-md transition-all ${timeRange === t ? "bg-(--gold) text-black" : "text-(--text-muted)"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        {chartData?.length ? (
          <BarChart data={chartData} valueKey={chartMode} labelKey={chartLabelKey}
            color={chartMode === "revenue" ? "var(--gold)" : "#818cf8"} showEvery={showEvery} />
        ) : (
          <div className="h-32 bg-(--bg-elevated) rounded-xl animate-pulse" />
        )}
        {chartData?.length && (
          <div className="mt-4 pt-3 border-t border-(--border)/40 flex items-center justify-between text-xs text-(--text-muted) font-mono">
            <span>Orders: <span className="text-(--text-primary) font-bold">{chartData.reduce((s, d) => s + (d.orders || 0), 0)}</span></span>
            <span>Revenue: <span className="text-(--gold) font-black">Rs. {chartData.reduce((s, d) => s + (d.revenue || 0), 0).toLocaleString()}</span></span>
          </div>
        )}
      </div>

      {/* ORDER STATUS + SPARKLINE ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ORDER STATUS DONUT */}
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
          <h3 className="text-(--text-primary) font-bold text-sm mb-5 flex items-center gap-2 border-b border-(--border)/50 pb-3">
            <FiPieChart size={14} className="text-(--gold)" /> Order Status Distribution
          </h3>
          <DonutChart data={donutData} />
          <div className="mt-4 pt-3 border-t border-(--border)/40 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="flex items-center justify-between bg-(--bg-elevated) rounded-lg px-3 py-2">
              <span className="text-(--text-muted)">Delivery Rate</span>
              <span className="text-emerald-400 font-black">{data?.conversionRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between bg-(--bg-elevated) rounded-lg px-3 py-2">
              <span className="text-(--text-muted)">Cancel Rate</span>
              <span className="text-red-400 font-black">{data?.cancelRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* TOP PRODUCTS TABLE */}
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-(--border) bg-(--bg-elevated)/10">
            <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2">
              <FiTrendingUp size={14} className="text-(--gold)" /> Top Performing Products
            </h3>
          </div>
          {data?.topProducts?.length ? (
            <div>
              {/* mini sparkline header */}
              <div className="px-5 pt-3 pb-1 opacity-60">
                <Sparkline data={data.last7Days || []} color="#c9a84c" height={30} />
              </div>
              <div className="divide-y divide-(--border)/50">
                {data.topProducts.map((p, i) => (
                  <div key={p.id || i} className="flex items-center justify-between px-5 py-3 hover:bg-(--bg-elevated)/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black font-mono shrink-0"
                        style={{ background: `${["#c9a84c","#818cf8","#4ade80","#60a5fa","#f87171"][i]}15`, color: ["#c9a84c","#818cf8","#4ade80","#60a5fa","#f87171"][i] }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-(--text-primary) text-xs font-semibold truncate max-w-40">{p.name}</p>
                        <p className="text-(--text-muted) text-[10px] font-mono">{p.qty} units sold</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-(--gold) text-xs font-black font-mono">Rs. {(p.revenue || 0).toLocaleString()}</p>
                      <p className="text-(--text-muted) text-[9px]">{Math.round(((p.revenue || 0) / (data.totalRevenue || 1)) * 100)}% share</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-(--text-muted) text-xs">No data found</div>
          )}
        </div>
      </div>

      {/* 6-MONTH TREND */}
      {data?.last6Months && (
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
          <h3 className="text-(--text-primary) font-bold text-sm mb-5 flex items-center gap-2 border-b border-(--border)/50 pb-3">
            <FiTrendingUp size={14} className="text-[#818cf8]" /> 6-Month Revenue Performance
          </h3>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {data.last6Months.map((m, i) => (
              <div key={i} className="text-center bg-(--bg-elevated) rounded-xl p-3 border border-(--border)/40">
                <p className="text-(--text-muted) text-[9px] font-bold uppercase mb-1">{m.month}</p>
                <p className="text-(--text-primary) text-xs font-black font-mono">
                  {m.revenue > 0 ? `Rs.${Math.round(m.revenue / 1000)}k` : "—"}
                </p>
                <p className="text-(--text-muted)/60 text-[9px] mt-0.5">{m.orders || 0} orders</p>
              </div>
            ))}
          </div>
          <BarChart data={data.last6Months} valueKey="revenue" labelKey="month" color="#818cf8" />
        </div>
      )}

    </div>
  );
}
