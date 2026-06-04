import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag,
  FiUsers, FiPackage, FiRefreshCw, FiBarChart2, FiPieChart,
  FiActivity, FiTarget, FiAward, FiAlertTriangle, FiSearch,
  FiFilter, FiDownload, FiEdit3, FiCalendar, FiFileText, FiPrinter
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
                  Rs. {Math.round(d[valueKey] || 0).toLocaleString()}
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

/* ── Comparison Bar Chart (Revenue & Profit side-by-side) ── */
function ComparisonBarChart({ data = [], labelKey }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue || 0, d.profit || 0)), 1);

  return (
    <div className="relative pt-4">
      <div className="flex items-end gap-3 h-40 relative z-10">
        {data.map((d, i) => {
          const revPct = Math.round(((d.revenue || 0) / maxVal) * 100);
          const prfPct = Math.round(((d.profit || 0) / maxVal) * 100);

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="w-full flex items-end justify-center gap-1 h-32">
                {/* Revenue Bar */}
                <div className="relative flex-1 flex justify-center h-full items-end">
                  <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-(--bg-elevated) border border-(--border) text-(--text-primary) text-[9px] px-1.5 py-0.5 rounded font-mono transition-transform z-20 whitespace-nowrap shadow-xl">
                    Rev: Rs. {Math.round(d.revenue).toLocaleString()}
                  </span>
                  <div
                    className="w-full rounded-t transition-all duration-700 ease-out bg-(--gold)"
                    style={{ height: `${Math.max(revPct, 3)}%`, opacity: 0.8 }}
                  />
                </div>
                {/* Profit Bar */}
                <div className="relative flex-1 flex justify-center h-full items-end">
                  <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-(--bg-elevated) border border-(--border) text-(--text-primary) text-[9px] px-1.5 py-0.5 rounded font-mono transition-transform z-20 whitespace-nowrap shadow-xl">
                    Profit: Rs. {Math.round(d.profit).toLocaleString()}
                  </span>
                  <div
                    className="w-full rounded-t transition-all duration-700 ease-out bg-emerald-500"
                    style={{ height: `${Math.max(prfPct, 3)}%`, opacity: 0.8 }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-(--text-muted) font-medium">{d[labelKey]}</span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-(--gold)" />
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
          <span>Net Profit</span>
        </div>
      </div>
    </div>
  );
}

/* ── Cumulative Growth Trend SVG Line Chart ── */
function CumulativeChart({ data = [], targetProfit = 500000 }) {
  if (!data.length) return null;

  // Calculate cumulative profit trends
  let cumProfit = 0;
  const cumData = data.map((d, idx) => {
    cumProfit += d.profit || 0;
    const targetAtMonth = (targetProfit / data.length) * (idx + 1);
    return {
      month: d.month,
      achieved: cumProfit,
      target: targetAtMonth,
    };
  });

  const maxVal = Math.max(targetProfit, cumProfit, 1);
  const w = 400, h = 180;
  const pad = 20;

  const achievedPts = cumData.map((d, i) => {
    const x = pad + (i / (cumData.length - 1)) * (w - 2 * pad);
    const y = h - pad - (d.achieved / maxVal) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(" ");

  const targetPts = cumData.map((d, i) => {
    const x = pad + (i / (cumData.length - 1)) * (w - 2 * pad);
    const y = h - pad - (d.target / maxVal) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm space-y-3">
      <h4 className="text-xs text-(--text-muted) uppercase tracking-wider font-bold">Cumulative Profit vs. Goal Target</h4>
      <div className="relative">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = pad + p * (h - 2 * pad);
            const val = maxVal - p * maxVal;
            return (
              <g key={idx}>
                <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <text x={pad + 2} y={y - 2} fill="var(--text-muted)" fontSize="8" className="font-mono opacity-80">
                  Rs. {Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Target line (dotted gray) */}
          <polyline fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" points={targetPts} />
          {/* Achieved line (gold glow) */}
          <polyline fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" points={achievedPts} />
          {/* Dots on achieved */}
          {cumData.map((d, i) => {
            const x = pad + (i / (cumData.length - 1)) * (w - 2 * pad);
            const y = h - pad - (d.achieved / maxVal) * (h - 2 * pad);
            return (
              <g key={i} className="group cursor-pointer">
                <circle cx={x} cy={y} r="3.5" fill="var(--bg-card)" stroke="var(--gold)" strokeWidth="2" />
                <circle cx={x} cy={y} r="8" fill="var(--gold)" opacity="0" className="hover:opacity-20 transition-opacity" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-dashed border-t border-(--text-muted)" />
          <span>Target Trend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-(--gold)" />
          <span>Cumulative Profit</span>
        </div>
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
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "profitability" | "products" | "goals" | "reports"
  const [data, setData] = useState(null); // Advanced stats
  const [profitData, setProfitData] = useState(null); // Profit metrics
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState("revenue"); // "revenue" | "orders"
  const [timeRange, setTimeRange] = useState("30d");     // "7d" | "30d" | "6m"

  // Product performance sorting & searching
  const [prodSearch, setProdSearch] = useState("");
  const [prodSort, setProdSort] = useState("revenueGenerated"); // name, price, stock, totalCost, unitProfit, marginPct, qtySold, revenueGenerated, profitGenerated
  const [prodSortOrder, setProdSortOrder] = useState("desc"); // asc | desc
  const [prodMarginFilter, setProdMarginFilter] = useState("all"); // all | Green | Yellow | Red
  const [prodStockFilter, setProdStockFilter] = useState("all"); // all | lowStock

  // Business goal form
  const [goalForm, setGoalForm] = useState({
    title: "",
    targetProfit: "",
    durationMonths: "",
    startDate: ""
  });
  const [savingGoal, setSavingGoal] = useState(false);

  // Report Generator parameters
  const [reportType, setReportType] = useState("sales_profit"); // sales_profit | products | customers
  const [reportRange, setReportRange] = useState("6m"); // 30d | 6m | all

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [resAdvanced, resProfit] = await Promise.all([
        api.get("/stats/advanced"),
        api.get("/stats/profit-analytics")
      ]);
      setData(resAdvanced?.data?.data || null);
      setProfitData(resProfit?.data?.data || null);

      if (resProfit?.data?.data?.goalStatus) {
        const goal = resProfit.data.data.goalStatus;
        setGoalForm({
          title: goal.title || "",
          targetProfit: goal.targetProfit || "",
          durationMonths: goal.durationMonths || "",
          startDate: goal.startDate ? new Date(goal.startDate).toISOString().split("T")[0] : ""
        });
      }
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      await api.put("/stats/goal", {
        title: goalForm.title,
        targetProfit: Number(goalForm.targetProfit),
        durationMonths: Number(goalForm.durationMonths),
        startDate: goalForm.startDate
      });
      toast.success("Business goal updated successfully!");
      load();
    } catch (err) {
      toast.error("Failed to update business goal");
      console.error(err);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleExportCSV = async (type) => {
    let headers = [];
    let rows = [];
    let filename = "";

    try {
      if (type === "sales_profit") {
        headers = ["Month", "Delivered Orders", "Revenue (Rs.)", "Est. Cost (Rs.)", "Net Profit (Rs.)", "Est. Profit Margin %"];
        const monthsData = profitData?.last6Months || [];
        monthsData.forEach(d => {
          const rev = d.revenue || 0;
          const prf = d.profit || 0;
          const cost = rev - prf;
          const margin = rev > 0 ? ((prf / rev) * 100).toFixed(1) : "0.0";
          rows.push([
            d.month,
            d.orders || 0,
            rev,
            cost,
            prf,
            margin
          ]);
        });
        filename = "sales_profit_6month_report.csv";
      } else if (type === "products") {
        headers = [
          "Product Name",
          "Category",
          "Selling Price (Rs.)",
          "Fabric Cost (Rs.)",
          "Printing Cost (Rs.)",
          "Packaging Cost (Rs.)",
          "Branding Cost (Rs.)",
          "Delivery Cost (Rs.)",
          "Ads Cost (Rs.)",
          "Misc Cost (Rs.)",
          "Total Product Cost (Rs.)",
          "Unit Net Profit (Rs.)",
          "Profit Margin %",
          "ROI %",
          "Qty Sold",
          "Total Revenue (Rs.)",
          "Total Net Profit (Rs.)",
          "Inventory Stock Remaining"
        ];
        
        const productsStats = profitData?.productStats || [];
        productsStats.forEach(p => {
          rows.push([
            p.name,
            p.category,
            p.price,
            p.fabricCost,
            p.printingCost,
            p.packagingCost,
            p.brandingCost,
            p.deliveryCost,
            p.adsCost,
            p.miscCost,
            p.totalCost,
            p.unitProfit,
            p.marginPct.toFixed(1),
            p.roiPct.toFixed(1),
            p.qtySold,
            p.revenueGenerated,
            p.profitGenerated,
            p.stock
          ]);
        });
        filename = "product_margins_performance_report.csv";
      } else if (type === "customers") {
        toast.info("Preparing customer orders report...");
        const resOrders = await api.get("/orders?limit=250");
        const list = resOrders?.data?.data?.orders || [];
        
        headers = ["Order ID", "Customer Details", "Date", "Payment Method", "Order Status", "Items Ordered", "Total Revenue (Rs.)", "Total Cost (Rs.)", "Net Profit (Rs.)"];
        
        list.forEach(o => {
          const custName = o.user?.name || o.guestInfo?.name || "Guest";
          const custEmail = o.user?.email || o.guestInfo?.email || "";
          const itemsCount = o.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0;
          const totalCostVal = o.totalCost !== undefined ? o.totalCost : 0;
          const netProfitVal = o.netProfit !== undefined ? o.netProfit : (o.totalPrice - totalCostVal);

          rows.push([
            o._id,
            `${custName} (${custEmail})`,
            new Date(o.createdAt).toLocaleDateString("en-PK"),
            o.paymentMethod,
            o.orderStatus,
            itemsCount,
            o.totalPrice,
            totalCostVal,
            netProfitVal
          ]);
        });
        filename = "customer_sales_margins_report.csv";
      } else if (type === "categories") {
        headers = ["Category", "Revenue (Rs.)", "Units Sold", "Revenue Share %"];
        const categories = topCategories;
        const overallRevenue = categories.reduce((sum, category) => sum + (category.revenue || 0), 0) || 1;
        categories.forEach((category) => {
          rows.push([
            category.category,
            category.revenue,
            category.units,
            ((category.revenue / overallRevenue) * 100).toFixed(1)
          ]);
        });
        filename = "category_performance_report.csv";
      }

      // Download CSV
      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${filename} successfully!`);
    } catch (err) {
      toast.error("Failed to generate CSV report");
      console.error(err);
    }
  };

  const triggerPrintPDF = () => {
    window.print();
  };

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

  // Margin status statistics
  const marginCounts = profitData?.productStats ? (() => {
    let green = 0, yellow = 0, red = 0;
    profitData.productStats.forEach(p => {
      if (p.marginStatus === "Green") green++;
      else if (p.marginStatus === "Yellow") yellow++;
      else red++;
    });
    return { green, yellow, red };
  })() : { green: 0, yellow: 0, red: 0 };

  // Filtered and sorted productStats
  const filteredProducts = profitData?.productStats ? profitData.productStats.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(prodSearch.toLowerCase());
    
    const matchesMargin = prodMarginFilter === "all" || p.marginStatus === prodMarginFilter;
    const matchesStock = prodStockFilter === "all" || (prodStockFilter === "lowStock" && p.stock <= 5);

    return matchesSearch && matchesMargin && matchesStock;
  }).sort((a, b) => {
    let fieldA = a[prodSort];
    let fieldB = b[prodSort];

    if (typeof fieldA === "string") {
      fieldA = fieldA.toLowerCase();
      fieldB = fieldB.toLowerCase();
    }

    if (fieldA < fieldB) return prodSortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return prodSortOrder === "asc" ? 1 : -1;
    return 0;
  }) : [];

  /* Derived display variables */
  const topCategories = data?.topCategories || [];
  const paymentMethods = data?.paymentMethods || [];

  // 30-day revenue forecast based on recent daily average
  const forecastRevenue = data?.last7Days?.length
    ? Math.round(
        (data.last7Days.reduce((s, d) => s + (d.revenue || 0), 0) /
          data.last7Days.length) *
          30
      )
    : 0;

  // 30-day profit forecast based on recent monthly average
  const forecastProfit = profitData?.last6Months?.length
    ? (() => {
        const recent = profitData.last6Months.slice(-2);
        const avg =
          recent.reduce((s, m) => s + (m.profit || 0), 0) /
          (recent.length || 1);
        return Math.round(avg);
      })()
    : 0;

  const toggleProductSort = (field) => {
    if (prodSort === field) {
      setProdSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setProdSort(field);
      setProdSortOrder("desc");
    }
  };

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
    <div className="space-y-6 max-w-400 mx-auto p-1 sm:p-4 print:p-0">
      
      {/* Dynamic Print CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
            background: transparent !important;
          }
          #print-report-container, #print-report-container * {
            visibility: visible;
          }
          #print-report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* HEADER (Hidden in print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-(--bg-card) border border-(--border) p-6 rounded-2xl shadow-sm no-print">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-(--gold) uppercase mb-0.5">📊 Business Intelligence Hub</p>
          <h2 className="font-display text-2xl font-black text-(--text-primary)">Profit & Analytics Hub</h2>
          <p className="text-(--text-muted) text-xs mt-1">Real-time revenue, production costs, net profits, and business goals</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-xs font-medium text-(--text-muted) bg-(--bg-elevated) border border-(--border) px-4 py-2.5 rounded-xl hover:text-(--text-primary) hover:border-(--border-light) transition-all cursor-pointer">
          <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* TABS (Hidden in print) */}
      <div className="flex bg-(--bg-card) border border-(--border) p-1 rounded-2xl overflow-x-auto no-scrollbar gap-1 scroll-smooth no-print">
        {[
          { id: "overview", label: "Overview & Trends", Icon: FiBarChart2 },
          { id: "profitability", label: "Profitability Analysis", Icon: FiDollarSign },
          { id: "products", label: "Product Performance", Icon: FiPackage },
          { id: "goals", label: "Goal & Growth Tracker", Icon: FiTarget },
          { id: "reports", label: "Report Exporter", Icon: FiFileText },
        ].map((tab) => {
          const ActiveIcon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-3.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-(--gold) text-black font-semibold shadow-md"
                  : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)"
              }`}
            >
              <ActiveIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────── TAB 1: OVERVIEW ──────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6 no-print">
          {/* KPI CARDS */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard label="Total Revenue" Icon={FiDollarSign} color="#c9a84c" bg="rgba(201,168,76,0.1)"
              value={`Rs. ${(data?.totalRevenue || 0).toLocaleString()}`} 
              sub={`This month: Rs. ${(data?.thisMonthRevenue || 0).toLocaleString()}`}
              trend={revenueGrowth >= 0 ? "up" : "down"}
              trendVal={revenueGrowth !== null ? `${Math.abs(revenueGrowth)}%` : undefined} />
            <KpiCard label="Avg Order Value" Icon={FiTarget} color="#818cf8" bg="rgba(129,140,248,0.1)"
              value={`Rs. ${(data?.avgOrderValue || 0).toLocaleString()}`}
              sub={`Conversion rate: ${data?.conversionRate || 0}%`} />
            <KpiCard label="Total Products" Icon={FiPackage} color="#34d399" bg="rgba(52,211,153,0.1)"
              value={data?.totalProducts || 0}
              sub={`${data?.lowStockCount || 0} low stock alerts`}
              trend={(data?.lowStockCount || 0) > 0 ? "down" : "up"}
              trendVal={(data?.lowStockCount || 0) > 0 ? `${data.lowStockCount} items` : "All clear"} />
            <KpiCard label="Total Customers" Icon={FiUsers} color="#c084fc" bg="rgba(192,132,252,0.1)"
              value={data?.totalUsers || 0}
              sub={`+${data?.newUsersThisMonth || 0} this month`} />
            <KpiCard label="30-Day Revenue Forecast" Icon={FiCalendar} color="#f97316" bg="rgba(249,115,22,0.1)"
              value={`Rs. ${(forecastRevenue || 0).toLocaleString()}`}
              sub={`Est. profit: Rs. ${(forecastProfit || 0).toLocaleString()}`} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
              <h3 className="text-(--text-primary) font-bold text-sm mb-4 flex items-center gap-2 border-b border-(--border)/50 pb-3">
                <FiTrendingUp size={14} className="text-(--gold)" /> Category Revenue Leaders
              </h3>
              {topCategories.length ? (
                <div className="space-y-3">
                  {topCategories.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-(--bg-elevated) border border-(--border)/50">
                      <div>
                        <p className="text-xs font-semibold text-(--text-primary)">{cat.category}</p>
                        <p className="text-[10px] text-(--text-muted)">Units sold: {cat.units}</p>
                      </div>
                      <div className="text-right font-mono font-bold text-(--gold)">Rs. {Math.round(cat.revenue).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-(--text-muted) text-xs">No category revenue data available.</div>
              )}
            </div>

            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
              <h3 className="text-(--text-primary) font-bold text-sm mb-4 flex items-center gap-2 border-b border-(--border)/50 pb-3">
                <FiActivity size={14} className="text-(--gold)" /> Payment Method Breakdown
              </h3>
              {paymentMethods.length ? (
                <div className="space-y-3">
                  {paymentMethods.map((item) => (
                    <div key={item.method} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-(--bg-elevated) border border-(--border)/50">
                      <div>
                        <p className="text-xs font-semibold text-(--text-primary)">{item.method}</p>
                        <p className="text-[10px] text-(--text-muted)">{item.orders} orders</p>
                      </div>
                      <div className="text-right font-mono font-bold text-(--gold)">Rs. {Math.round(item.revenue).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-(--text-muted) text-xs">Payment method data unavailable.</div>
              )}
            </div>
          </div>

          {/* MAIN REVENUE CHART */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--border)/50 pb-4 mb-5">
              <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2">
                <FiBarChart2 size={15} className="text-(--gold)" />
                Sales & Revenue Volume
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mode toggle */}
                <div className="flex bg-(--bg-elevated) p-0.5 rounded-lg border border-(--border) text-[10px] font-bold">
                  {[["revenue", "Revenue"], ["orders", "Orders"]].map(([m, l]) => (
                    <button key={m} onClick={() => setChartMode(m)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${chartMode === m ? "bg-(--gold) text-black" : "text-(--text-muted)"}`}>
                      {l}
                    </button>
                  ))}
                </div>
                {/* Range toggle */}
                <div className="flex bg-(--bg-elevated) p-0.5 rounded-lg border border-(--border) text-[10px] font-bold">
                  {[["7d", "7D"], ["30d", "30D"], ["6m", "6M"]].map(([t, l]) => (
                    <button key={t} onClick={() => setTimeRange(t)}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${timeRange === t ? "bg-(--gold) text-black" : "text-(--text-muted)"}`}>
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
          </div>

          {/* DISTRIBUTION ROW */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* ORDER STATUS */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
              <h3 className="text-(--text-primary) font-bold text-sm mb-5 flex items-center gap-2 border-b border-(--border)/50 pb-3">
                <FiPieChart size={14} className="text-(--gold)" /> Order Status Distribution
              </h3>
              <DonutChart data={donutData} />
            </div>

            {/* TOP PERFORMING */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-(--border) bg-(--bg-elevated)/10">
                <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2">
                  <FiTrendingUp size={14} className="text-(--gold)" /> Top Performing Products
                </h3>
              </div>
              {data?.topProducts?.length ? (
                <div>
                  <div className="px-5 pt-3 pb-1 opacity-60">
                    <Sparkline data={data.last7Days || []} color="#c9a84c" height={30} />
                  </div>
                  <div className="divide-y divide-(--border)/50">
                    {data.topProducts.map((p, i) => (
                      <div key={p.id || i} className="flex items-center justify-between px-5 py-3.5 hover:bg-(--bg-elevated)/40 transition-colors">
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
                          <p className="text-(--gold) text-xs font-black font-mono font-semibold">Rs. {(p.revenue || 0).toLocaleString()}</p>
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
        </div>
      )}

      {/* ──────────────── TAB 2: PROFITABILITY ──────────────── */}
      {activeTab === "profitability" && (
        <div className="space-y-6 no-print">
          {/* PROFIT KPI CARDS */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Delivered Net Profit" Icon={FiDollarSign} color="#10b981" bg="rgba(16,185,129,0.1)"
              value={`Rs. ${Math.round(profitData?.totalProfit || 0).toLocaleString()}`}
              sub={`Est. Costs: Rs. ${Math.round((profitData?.totalRevenue || 0) - (profitData?.totalProfit || 0)).toLocaleString()}`} />
            
            <KpiCard label="Overall Profit Margin" Icon={FiTrendingUp} color="#c9a84c" bg="rgba(201,168,76,0.1)"
              value={`${profitData?.totalRevenue > 0 ? ((profitData.totalProfit / profitData.totalRevenue) * 100).toFixed(1) : "0.0"}%`}
              sub="Avg. product margin targets: 30%+" />

            <KpiCard label="COD Pending Capital" Icon={FiShoppingBag} color="#f59e0b" bg="rgba(245,158,11,0.1)"
              value={`Rs. ${Math.round(profitData?.codPendingAmount || 0).toLocaleString()}`}
              sub={`${profitData?.pendingOrdersCount || 0} orders awaiting delivery`} />

            <KpiCard label="Cancellations & Returns" Icon={FiAlertTriangle} color="#ef4444" bg="rgba(239,68,68,0.1)"
              value={`${profitData?.cancelledStats?.count || 0} Orders`}
              sub={`Potential loss: Rs. ${Math.round(profitData?.cancelledStats?.lostRevenue || 0).toLocaleString()}`} />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
              <h3 className="text-(--text-primary) font-bold text-sm mb-4 flex items-center gap-2 border-b border-(--border)/50 pb-3">
                <FiAlertTriangle size={14} className="text-red-500" /> Inventory Risk Value
              </h3>
              <p className="text-xs text-(--text-muted) mb-3">Estimated capital exposed by low-stock products with cost risk.</p>
              <p className="text-2xl font-black text-(--gold)">Rs. {Math.round(profitData?.inventoryValueAtRisk || 0).toLocaleString()}</p>
              <p className="text-[10px] text-(--text-muted) mt-2">Low stock items (≤5 units) may require restock action.</p>
            </div>
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
              <h3 className="text-(--text-primary) font-bold text-sm mb-4 flex items-center gap-2 border-b border-(--border)/50 pb-3">
                <FiCalendar size={14} className="text-(--gold)" /> Goal Completion Forecast
              </h3>
              <p className="text-xs text-(--text-muted) mb-3">Projected completion date based on current profit pace.</p>
              <p className="text-2xl font-black text-(--text-primary)">{profitData?.goalStatus?.estimatedCompletionDate || "N/A"}</p>
              <p className="text-[10px] text-(--text-muted) mt-2">Current pace: Rs. {profitData?.goalStatus?.profitPerDay || 0}/day</p>
            </div>
          </div>

          {/* SIDE-BY-SIDE REVENUE VS PROFIT CHART */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
            <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2 border-b border-(--border)/50 pb-4 mb-4">
              <FiBarChart2 size={15} className="text-(--gold)" />
              6-Month Revenue vs. Net Profit Performance
            </h3>
            {profitData?.last6Months?.length ? (
              <ComparisonBarChart data={profitData.last6Months} labelKey="month" />
            ) : (
              <div className="h-40 bg-(--bg-elevated) rounded-xl animate-pulse" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CATALOG MARGIN STATS */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm md:col-span-1">
              <h3 className="text-(--text-primary) font-bold text-sm border-b border-(--border)/50 pb-3 mb-4">
                Product Margin Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-(--text-muted)">High Margin (&gt;=30%)</span>
                  </div>
                  <span className="font-bold text-green-400">{marginCounts.green} products</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-(--text-muted)">Medium Margin (10-30%)</span>
                  </div>
                  <span className="font-bold text-yellow-400">{marginCounts.yellow} products</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-(--text-muted)">Low / Negative Margin (&lt;10%)</span>
                  </div>
                  <span className="font-bold text-red-400">{marginCounts.red} products</span>
                </div>
              </div>
            </div>

            {/* LOSS & LOGISTICS ANALYSIS */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm md:col-span-2 space-y-4">
              <h3 className="text-(--text-primary) font-bold text-sm border-b border-(--border)/50 pb-3">
                Returns & Cancelled Orders Assessment
              </h3>
              <p className="text-xs text-(--text-muted)">
                When customer orders are cancelled or failed, the delivery fees and packaging expenses might still be incurred. Stock is recovered, but marketing and transactional costs represent capital wastage.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-(--bg-elevated) p-3.5 rounded-xl border border-(--border)/40 text-center">
                  <p className="text-[10px] text-(--text-muted) uppercase font-bold mb-1">Recovered Goods Value</p>
                  <p className="font-mono text-sm font-semibold text-(--text-primary)">
                    Rs. {Math.round(profitData?.cancelledStats?.lostCost || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-(--bg-elevated) p-3.5 rounded-xl border border-(--border)/40 text-center">
                  <p className="text-[10px] text-(--text-muted) uppercase font-bold mb-1">Ad Cost / Delivery Wastage</p>
                  <p className="font-mono text-sm font-semibold text-red-400">
                    Rs. {Math.round((profitData?.cancelledStats?.lostCost || 0) * 0.15).toLocaleString()}
                  </p>
                </div>
                <div className="bg-(--bg-elevated) p-3.5 rounded-xl border border-(--border)/40 text-center col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-(--text-muted) uppercase font-bold mb-1">Lost Order Revenue</p>
                  <p className="font-mono text-sm font-semibold text-(--gold)">
                    Rs. {Math.round(profitData?.cancelledStats?.lostRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: PRODUCT PERFORMANCE ──────────────── */}
      {activeTab === "products" && (
        <div className="space-y-4 no-print">
          {/* SEARCH & FILTERS CONTROLS */}
          <div className="bg-(--bg-card) border border-(--border) p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 bg-(--bg-elevated) border border-(--border) rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-md">
              <FiSearch className="text-(--text-muted)" size={14} />
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Search products by name or category..."
                className="bg-transparent border-none outline-none text-xs text-(--text-primary) w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-(--text-muted)">
                <FiFilter size={12} />
                <span>Margin:</span>
                <select
                  value={prodMarginFilter}
                  onChange={(e) => setProdMarginFilter(e.target.value)}
                  className="bg-(--bg-elevated) border border-(--border) rounded-lg px-2.5 py-1.5 text-xs text-(--text-primary) font-semibold outline-none cursor-pointer"
                >
                  <option value="all">All Margins</option>
                  <option value="Green">High Margin (Green)</option>
                  <option value="Yellow">Medium Margin (Yellow)</option>
                  <option value="Red">Low/Neg Margin (Red)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-(--text-muted)">
                <span>Stock:</span>
                <select
                  value={prodStockFilter}
                  onChange={(e) => setProdStockFilter(e.target.value)}
                  className="bg-(--bg-elevated) border border-(--border) rounded-lg px-2.5 py-1.5 text-xs text-(--text-primary) font-semibold outline-none cursor-pointer"
                >
                  <option value="all">All Inventory</option>
                  <option value="lowStock">Low Stock (Stock &lt;= 5)</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCTS SPREADSHEET TABLE */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-(--border) bg-(--bg-elevated)/40 text-(--text-muted) uppercase tracking-wider font-bold text-[10px]">
                    <th className="p-4 select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("name")}>Product</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("price")}>Price</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("totalCost")}>Est. Cost</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("unitProfit")}>Profit</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("marginPct")}>Margin</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("qtySold")}>Qty Sold</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("revenueGenerated")}>Revenue</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("profitGenerated")}>Net Profit</th>
                    <th className="p-4 text-center select-none cursor-pointer hover:text-(--text-primary)" onClick={() => toggleProductSort("stock")}>Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)/40 font-mono text-(--text-primary)">
                  {filteredProducts.length ? (
                    filteredProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-(--bg-elevated)/10 transition-colors">
                        <td className="p-4 font-sans text-xs font-semibold max-w-[200px]">
                          <div>
                            <span className="truncate block font-bold text-(--text-primary)">{p.name}</span>
                            <span className="text-[10px] text-(--text-muted) uppercase font-bold">{p.category}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">Rs. {p.price.toLocaleString()}</td>
                        <td className="p-4 text-center group relative cursor-help">
                          <span className="underline decoration-dotted decoration-(--gold)">
                            Rs. {p.totalCost.toLocaleString()}
                          </span>
                          {/* Hover Cost Details Popup */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-(--bg-card) border border-(--border) p-3 rounded-lg shadow-2xl z-50 text-[10px] text-left leading-relaxed w-48 scale-0 group-hover:scale-100 transition-transform origin-bottom text-(--text-primary)">
                            <p className="font-bold border-b pb-1 mb-1 font-sans text-xs">Cost Composition</p>
                            <div className="flex justify-between"><span>Fabric:</span><span>Rs. {p.fabricCost}</span></div>
                            <div className="flex justify-between"><span>Printing:</span><span>Rs. {p.printingCost}</span></div>
                            <div className="flex justify-between"><span>Packaging:</span><span>Rs. {p.packagingCost}</span></div>
                            <div className="flex justify-between"><span>Branding:</span><span>Rs. {p.brandingCost}</span></div>
                            <div className="flex justify-between"><span>Delivery:</span><span>Rs. {p.deliveryCost}</span></div>
                            <div className="flex justify-between"><span>Ads/Marketing:</span><span>Rs. {p.adsCost}</span></div>
                            <div className="flex justify-between border-t mt-1 pt-1 font-bold"><span>Total:</span><span>Rs. {p.totalCost}</span></div>
                          </div>
                        </td>
                        <td className={`p-4 text-center font-bold ${p.unitProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                          Rs. {p.unitProfit.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                            p.marginStatus === "Green"
                              ? "text-emerald-400 bg-emerald-950/20 border-emerald-800/30"
                              : p.marginStatus === "Yellow"
                              ? "text-amber-400 bg-amber-950/20 border-amber-800/30"
                              : "text-red-400 bg-red-950/20 border-red-800/30"
                          }`}>
                            {p.marginPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-(--text-secondary)">{p.qtySold}</td>
                        <td className="p-4 text-center">Rs. {p.revenueGenerated.toLocaleString()}</td>
                        <td className={`p-4 text-center font-bold ${p.profitGenerated >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          Rs. {Math.round(p.profitGenerated).toLocaleString()}
                        </td>
                        <td className="p-4 text-center font-sans">
                          {p.stock <= 5 ? (
                            <span className="bg-red-950/20 border border-red-800/30 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Low ({p.stock})
                            </span>
                          ) : (
                            <span className="text-(--text-muted) font-mono">{p.stock}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-10 text-center text-(--text-muted) text-xs font-sans">
                        No products match your search or filter selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: GOALS ──────────────── */}
      {activeTab === "goals" && (
        <div className="space-y-6 no-print">
          {/* Goal Metrics Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Progress Circular Dial */}
            <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
              <h3 className="text-xs text-(--text-muted) uppercase tracking-wider font-bold text-center">Goal Achieved Progress</h3>
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (profitData?.goalStatus?.progressPct || 0) / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-(--text-primary)">
                    {profitData?.goalStatus?.progressPct || 0}%
                  </span>
                  <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider">Completed</span>
                </div>
              </div>
              <p className="text-xs text-(--text-secondary) font-bold text-center">
                Rs. {Math.round(profitData?.goalStatus?.achievedProfit || 0).toLocaleString()} made of Rs. {Math.round(profitData?.goalStatus?.targetProfit || 500000).toLocaleString()}
              </p>
            </div>

            {/* Calculations Card Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-(--text-muted) uppercase tracking-wider font-bold">Remaining Target Profit</p>
                  <p className="font-display text-2xl font-black text-(--gold) font-mono mt-1">
                    Rs. {Math.round(profitData?.goalStatus?.remainingProfit || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-[10px] text-(--text-muted) font-medium mt-2">
                  Remaining amount to satisfy target goal.
                </div>
              </div>

              <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-(--text-muted) uppercase tracking-wider font-bold">Remaining Duration Time</p>
                  <p className="font-display text-2xl font-black text-(--text-primary) font-mono mt-1">
                    {profitData?.goalStatus?.remainingMonths || 0} mos
                  </p>
                </div>
                <div className="text-[10px] text-(--text-muted) font-medium mt-2">
                  Approx {profitData?.goalStatus?.remainingDays || 0} days remaining of the goal window.
                </div>
              </div>

              <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm flex flex-col justify-between col-span-2">
                <div>
                  <p className="text-[10px] text-(--text-muted) uppercase tracking-wider font-bold">Monthly Target Net Profit Needed</p>
                  <p className="font-display text-2xl font-black text-emerald-400 font-mono mt-1">
                    Rs. {Math.round(profitData?.goalStatus?.monthlyRequiredProfit || 0).toLocaleString()} /mo
                  </p>
                </div>
                <div className="text-[10px] text-(--text-muted) font-medium mt-2">
                  Required average monthly profit to hit goal within remaining time range.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
                <h3 className="text-(--text-primary) font-bold text-sm mb-4 border-b border-(--border)/50 pb-3 flex items-center gap-2">
                  <FiAlertTriangle className="text-red-500" /> Inventory Risk Value
                </h3>
                <p className="text-xs text-(--text-muted) mb-3">Estimated capital exposed by low-stock, high-cost SKUs.</p>
                <p className="text-2xl font-black text-(--gold)">Rs. {Math.round(profitData?.inventoryValueAtRisk || 0).toLocaleString()}</p>
                <p className="text-[10px] text-(--text-muted) mt-2">Low supply items (≤5 units) may need restock planning.</p>
              </div>
              <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
                <h3 className="text-(--text-primary) font-bold text-sm mb-4 border-b border-(--border)/50 pb-3 flex items-center gap-2">
                  <FiCalendar className="text-(--gold)" /> Goal Completion Forecast
                </h3>
                <p className="text-xs text-(--text-muted) mb-3">Projected completion date based on current profit pace.</p>
                <p className="text-2xl font-black text-(--text-primary)">{profitData?.goalStatus?.estimatedCompletionDate || "N/A"}</p>
                <p className="text-[10px] text-(--text-muted) mt-2">Current pace: Rs. {profitData?.goalStatus?.profitPerDay || 0}/day</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <CumulativeChart data={profitData?.last6Months || []} targetProfit={profitData?.goalStatus?.targetProfit || 500000} />

              {/* Edit Goal Settings */}
              <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 shadow-sm">
              <h3 className="text-(--text-primary) font-bold text-sm mb-4 border-b border-(--border)/50 pb-3 flex items-center gap-2">
                <FiEdit3 className="text-(--gold)" /> Update Business Goal Parameters
              </h3>
              <form onSubmit={handleUpdateGoal} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-(--text-muted) uppercase tracking-wider mb-2">Goal Title Description</label>
                  <input
                    type="text"
                    required
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    placeholder="e.g. Achieve 500k PKR Net Profit"
                    className="lux-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-(--text-muted) uppercase tracking-wider mb-2">Target Profit (PKR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={goalForm.targetProfit}
                      onChange={(e) => setGoalForm({ ...goalForm, targetProfit: e.target.value })}
                      placeholder="500000"
                      className="lux-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-(--text-muted) uppercase tracking-wider mb-2">Goal Duration (Months)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={goalForm.durationMonths}
                      onChange={(e) => setGoalForm({ ...goalForm, durationMonths: e.target.value })}
                      placeholder="6"
                      className="lux-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-(--text-muted) uppercase tracking-wider mb-2">Goal Start Date</label>
                  <input
                    type="date"
                    required
                    value={goalForm.startDate}
                    onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
                    className="lux-input"
                  />
                </div>
                <button type="submit" disabled={savingGoal} className="btn-gold w-full py-3 text-xs tracking-wider uppercase font-semibold">
                  {savingGoal ? "Saving settings..." : "Update Business Goal"}
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* ──────────────── TAB 5: REPORTS ──────────────── */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
          {/* Export CSV Control Panel */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2 border-b border-(--border)/50 pb-3">
              <FiFileText className="text-(--gold)" /> Excel Spreadsheet Exporter
            </h3>
            <p className="text-xs text-(--text-muted) leading-relaxed">
              Export transactional data files containing costs, selling prices, categories, and order margins directly into format-escaped CSV spreadsheets compatible with Microsoft Excel and Google Sheets.
            </p>
            
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleExportCSV("sales_profit")}
                className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 rounded-xl border border-(--border) hover:border-(--gold)/30 bg-(--bg-elevated)/40 hover:bg-(--bg-elevated) transition-all text-(--text-primary) cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FiDollarSign className="text-(--gold)" /> 6-Month Profit & Sales Report
                </span>
                <FiDownload />
              </button>

              <button
                onClick={() => handleExportCSV("products")}
                className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 rounded-xl border border-(--border) hover:border-(--gold)/30 bg-(--bg-elevated)/40 hover:bg-(--bg-elevated) transition-all text-(--text-primary) cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FiPackage className="text-(--gold)" /> Catalog Products Profit Margins Report
                </span>
                <FiDownload />
              </button>

              <button
                onClick={() => handleExportCSV("categories")}
                className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 rounded-xl border border-(--border) hover:border-(--gold)/30 bg-(--bg-elevated)/40 hover:bg-(--bg-elevated) transition-all text-(--text-primary) cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FiPieChart className="text-(--gold)" /> Category Performance Report
                </span>
                <FiDownload />
              </button>

              <button
                onClick={() => handleExportCSV("customers")}
                className="w-full flex items-center justify-between text-xs font-semibold px-4 py-3 rounded-xl border border-(--border) hover:border-(--gold)/30 bg-(--bg-elevated)/40 hover:bg-(--bg-elevated) transition-all text-(--text-primary) cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FiUsers className="text-(--gold)" /> Customer Orders Profit Margins Log
                </span>
                <FiDownload />
              </button>
            </div>
          </div>

          {/* Print PDF / Print Window Control Panel */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-(--text-primary) font-bold text-sm flex items-center gap-2 border-b border-(--border)/50 pb-3">
                <FiPrinter className="text-(--gold)" /> Printable PDF Assessment
              </h3>
              <p className="text-xs text-(--text-muted) leading-relaxed mt-4">
                Compile a professional printable PDF document detailing overall business totals, profit ratios, goal status progress, and order status assessments. Click the compile button below to open the native browser layout compiler.
              </p>
            </div>

            <button
              onClick={triggerPrintPDF}
              className="btn-gold w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiPrinter /> Compile Printable PDF Report
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── PRINTABLE PDF LAYOUT CONTAINER (Visible only in print) ──────────────── */}
      <div id="print-report-container" className="hidden font-serif p-8 text-black space-y-6">
        <div className="text-center border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-bold tracking-wide uppercase">Urban Threads Store</h1>
          <p className="text-sm font-semibold tracking-wider">Profit & Margin Business Intelligence Report</p>
          <p className="text-xs text-gray-500 mt-1">Generated: {new Date().toLocaleString("en-PK")}</p>
        </div>

        {/* Business Totals */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold border-b border-gray-200 pb-1">Overall Business Totals</h3>
          <table className="w-full text-xs text-left border">
            <tbody>
              <tr>
                <td className="p-2 font-bold border">Total Revenue Generated</td>
                <td className="p-2 border">Rs. {Math.round(profitData?.totalRevenue || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Total Cumulative Net Profit</td>
                <td className="p-2 border text-green-600 font-bold">Rs. {Math.round(profitData?.totalProfit || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Overall Profit Margin Ratio</td>
                <td className="p-2 border font-bold">
                  {profitData?.totalRevenue > 0 ? ((profitData.totalProfit / profitData.totalRevenue) * 100).toFixed(1) : "0.0"}%
                </td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Capital Frozen in COD Transit</td>
                <td className="p-2 border">Rs. {Math.round(profitData?.codPendingAmount || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Goals Progress */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold border-b border-gray-200 pb-1">Business Goal Assessment Status</h3>
          <p className="text-xs">Active Goal Title: <span className="font-bold">{profitData?.goalStatus?.title || "—"}</span></p>
          <table className="w-full text-xs text-left border">
            <tbody>
              <tr>
                <td className="p-2 font-bold border">Target Net Profit Required</td>
                <td className="p-2 border">Rs. {Math.round(profitData?.goalStatus?.targetProfit || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Net Profit Achieved to Date</td>
                <td className="p-2 border text-green-600 font-bold">Rs. {Math.round(profitData?.goalStatus?.achievedProfit || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Remaining Net Profit Needed</td>
                <td className="p-2 border">Rs. {Math.round(profitData?.goalStatus?.remainingProfit || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Months Remaining</td>
                <td className="p-2 border">{profitData?.goalStatus?.remainingMonths || 0} Months ({profitData?.goalStatus?.remainingDays || 0} Days)</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Monthly Net Profit Pace Needed</td>
                <td className="p-2 border text-emerald-600 font-bold">Rs. {Math.round(profitData?.goalStatus?.monthlyRequiredProfit || 0).toLocaleString()} /mo</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Target Accomplishment Percentage</td>
                <td className="p-2 border font-bold">{profitData?.goalStatus?.progressPct || 0}% Completed</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 6-Month Timeline */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold border-b border-gray-200 pb-1">6-Month Ledger Performance Timeline</h3>
          <table className="w-full text-xs text-left border">
            <thead>
              <tr className="bg-gray-100 font-bold">
                <th className="p-2 border">Month</th>
                <th className="p-2 border text-center">Orders</th>
                <th className="p-2 border text-right">Revenue (Rs.)</th>
                <th className="p-2 border text-right">Est. Costs (Rs.)</th>
                <th className="p-2 border text-right">Net Profit (Rs.)</th>
                <th className="p-2 border text-center">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {profitData?.last6Months?.map((m, idx) => {
                const rev = m.revenue || 0;
                const prf = m.profit || 0;
                const cost = rev - prf;
                return (
                  <tr key={idx}>
                    <td className="p-2 border font-bold">{m.month}</td>
                    <td className="p-2 border text-center">{m.orders}</td>
                    <td className="p-2 border text-right">Rs. {Math.round(rev).toLocaleString()}</td>
                    <td className="p-2 border text-right">Rs. {Math.round(cost).toLocaleString()}</td>
                    <td className="p-2 border text-right font-bold text-green-600">Rs. {Math.round(prf).toLocaleString()}</td>
                    <td className="p-2 border text-center">{rev > 0 ? ((prf / rev) * 100).toFixed(1) : "0.0"}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Returns Losses */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold border-b border-gray-200 pb-1">Order Cancellations & Loss Breakdown</h3>
          <table className="w-full text-xs text-left border">
            <tbody>
              <tr>
                <td className="p-2 font-bold border">Total Cancelled/Returned Orders Count</td>
                <td className="p-2 border">{profitData?.cancelledStats?.count || 0} Cancelled Orders</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Potential Revenue Lost (Stalled Sales)</td>
                <td className="p-2 border text-red-600">Rs. {Math.round(profitData?.cancelledStats?.lostRevenue || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border">Recovered Goods Value Re-inflowed</td>
                <td className="p-2 border text-green-600">Rs. {Math.round(profitData?.cancelledStats?.lostCost || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center text-[10px] text-gray-500 pt-10 border-t">
          <p>Confidential Business Intelligence Document — For Internal Administrative Review Only</p>
          <p>© 2026 Urban Threads Streetwear. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
}
