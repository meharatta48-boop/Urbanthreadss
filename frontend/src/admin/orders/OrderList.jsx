import { useState, useEffect, useCallback } from "react";
import api, { SERVER_URL } from "../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../context/SettingsContext";
import {
  FiRefreshCw, FiPhone, FiMail, FiMapPin, FiSearch,
  FiChevronDown, FiChevronUp, FiPackage, FiUser,
  FiTrash2, FiMessageCircle, FiPrinter, FiCheckSquare,
  FiSquare
} from "react-icons/fi";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_STYLE = {
  pending:    { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  text: "#f59e0b" },
  processing: { bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.2)",  text: "#c9a84c" },
  shipped:    { bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.2)", text: "#818cf8" },
  delivered:  { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.2)",  text: "#4ade80" },
  cancelled:  { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)", text: "#f87171" },
};

const getPhone = (o) => o.shippingAddress?.phone || o.guestInfo?.phone || "";
const getEmail = (o) => o.user?.email || o.guestInfo?.email || "";
const getName  = (o) => o.user?.name || o.guestInfo?.name || o.shippingAddress?.fullName || "Guest";

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {status}
    </span>
  );
}

async function printInvoice(order, fallbackSettings = {}) {
  const name    = getName(order);
  const phone   = getPhone(order);
  const email   = getEmail(order);
  const addr    = order.shippingAddress;

  // Always fetch FRESH settings from server — bypass any stale cache
  let s = fallbackSettings;
  try {
    const { data } = await api.get("/settings");
    if (data.success && data.settings) s = data.settings;
  } catch { /* use fallback */ }

  const brand   = s.brandName    || "URBAN THREAD";
  const bPhone  = s.invoiceShowPhone   !== false ? (s.phone   || "") : "";
  const bEmail  = s.invoiceShowEmail   !== false ? (s.email   || "") : "";
  const bAddr   = s.invoiceShowAddress !== false ? (s.address || "Pakistan") : "";
  const logoUrl = s.invoiceShowLogo    !== false && s.logoImage
    ? `${SERVER_URL}${s.logoImage}` : null;
  const tagline     = s.invoiceTagline    || "Official Invoice / Receipt";
  const thankYou    = s.invoiceThankYou   || "Shukriya hamse khareedne ka!";
  const footerNote  = s.invoiceFooterNote || "Yeh computer-generated invoice hai";
  const invoiceNote = s.invoiceNote       || "";
  const invoiceNo   = order._id.slice(-10).toUpperCase();
  const orderDate   = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric"
  });
  const deliveredDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : "—";


  const statusColor = {
    pending:    "#f59e0b", processing: "#c9a84c",
    shipped:    "#818cf8", delivered:  "#16a34a",
    cancelled:  "#ef4444",
  }[order.orderStatus] || "#555";

  const itemRows = (order.orderItems || []).map((item, i) => `
    <tr>
      <td class="td center muted">${i + 1}</td>
      <td class="td">
        <div class="item-name">${item.name}</div>
        ${item.size  ? `<div class="item-meta">Size: ${item.size}</div>` : ""}
        ${item.color ? `<div class="item-meta">Color: ${item.color}</div>` : ""}
      </td>
      <td class="td center">${item.quantity}</td>
      <td class="td right">Rs. ${item.price.toLocaleString()}</td>
      <td class="td right bold">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`).join("");

  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${invoiceNo} — ${brand}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; font-size: 13px; color: #111; background: #f3f4f7; padding: 0; }
    .page { max-width: 820px; margin: 0 auto; padding: 40px 0; }
    .invoice-card { background: #fff; border-radius: 28px; overflow: hidden; box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08); }
    .content { padding: 38px 46px; }

    /* HEADER */
    .header { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start; padding-bottom: 28px; border-bottom: 1px solid #e5e7eb; margin-bottom: 28px; }
    .brand-logo { width: 72px; height: 72px; object-fit: contain; border-radius: 18px; background: #f8fafc; padding: 12px; }
    .brand-name { font-size: 22px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .brand-tagline { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .brand-info { display: grid; gap: 6px; font-size: 12px; color: #6b7280; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 30px; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.04em; }
    .invoice-title .inv-no, .invoice-title .inv-date { font-size: 12px; color: #6b7280; line-height: 1.7; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 9px 14px; font-size: 11px; font-weight: 700; color: #fff; background: ${statusColor}; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.08em; }

    /* META ROW */
    .meta-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .meta-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 14px 16px; }
    .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 8px; }
    .meta-value { font-size: 13px; color: #111; font-weight: 500; line-height: 1.6; }
    .meta-value a { color: #2563eb; text-decoration: none; }
    .meta-value .muted { color: #777; font-size: 12px; font-weight: 400; }

    /* TABLE */
    .table-wrap { margin-bottom: 20px; border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #111; color: #fff; }
    thead th { padding: 10px 14px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
    .td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    .item-name { font-weight: 600; font-size: 13px; color: #111; }
    .item-meta { font-size: 11px; color: #777; margin-top: 2px; }
    tbody tr:last-child .td { border-bottom: none; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: 700; }
    .muted  { color: #999; }

    /* TOTALS */
    .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .totals-box { width: 260px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: 9px 16px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
    .totals-row:last-child { border-bottom: none; background: #111; color: #fff; font-weight: 700; font-size: 14px; }
    .totals-row.discount { color: #16a34a; }

    /* PAYMENT INFO */
    .payment-row { display: flex; gap: 16px; margin-bottom: 28px; }
    .payment-box { flex: 1; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 14px 16px; }

    /* NOTES */
    .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-bottom: 28px; }
    .notes-label { font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .notes-text { font-size: 13px; color: #78350f; }

    /* FOOTER */
    .footer { border-top: 1px solid #eee; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 12px; color: #777; line-height: 1.7; }
    .footer-right { text-align: right; font-size: 11px; color: #bbb; }
    .thankyou { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 4px; }

    /* PRINT */
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .page { padding: 24px 32px; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="invoice-card">
    <div class="content">
      <!-- PRINT BUTTON -->
      <div class="no-print" style="text-align:right;margin-bottom:16px">
    <button onclick="window.print()" style="background:#111;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
      🖨️ Print Invoice
    </button>
  </div>

  <!-- HEADER -->
  <div class="header">
    <div>
      ${logoUrl ? `<img src="${logoUrl}" class="brand-logo" alt="${brand}" onerror="this.style.display='none'" />` : ""}
      <div class="brand-name">${brand}</div>
      <div class="brand-tagline">${tagline}</div>
      ${bPhone ? `<div style="font-size:12px;color:#777;margin-top:4px;">📞 ${bPhone}</div>` : ""}
      ${bEmail ? `<div style="font-size:12px;color:#777;">✉️ ${bEmail}</div>` : ""}
      ${bAddr  ? `<div style="font-size:12px;color:#777;">📍 ${bAddr}</div>` : ""}
    </div>
    <div class="invoice-title">
      <h1>Invoice</h1>
      <div class="inv-no"># ${invoiceNo}</div>
      <div class="inv-date">📅 ${orderDate}</div>
      <div><span class="status-badge">${order.orderStatus}</span></div>
    </div>
  </div>

  <!-- META: BILL TO / SHIP TO / ORDER INFO -->
  <div class="meta-row">
    <div class="meta-box">
      <div class="meta-label">Bill To / Customer</div>
      <div class="meta-value">
        <strong>${name}</strong><br/>
        ${phone ? `<a href="tel:${phone}">📞 ${phone}</a><br/>` : ""}
        ${email ? `<a href="mailto:${email}">✉️ ${email}</a><br/>` : ""}
        ${!order.user ? '<span class="muted">(Guest Order)</span>' : '<span class="muted">(Registered)</span>'}
      </div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Ship To / Delivery</div>
      <div class="meta-value">
        ${addr ? `
          <strong>${addr.fullName}</strong><br/>
          ${addr.address}<br/>
          ${addr.city}${addr.province ? ", " + addr.province : ""}<br/>
          ${addr.postalCode ? "Postal: " + addr.postalCode + "<br/>" : ""}
          <span class="muted">Pakistan 🇵🇰</span>
        ` : "<span class='muted'>No address provided</span>"}
      </div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Order Details</div>
      <div class="meta-value">
        <strong>Order ID:</strong> #${invoiceNo}<br/>
        <strong>Date:</strong> ${orderDate}<br/>
        <strong>Delivered:</strong> ${deliveredDate}<br/>
        <strong>Payment:</strong> ${order.paymentMethod || "COD"}<br/>
        <strong>Pay Status:</strong> <span style="color:${order.paymentStatus === "paid" ? "#16a34a" : "#f59e0b"};font-weight:700">${order.paymentStatus || "pending"}</span>
      </div>
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th style="width:36px">#</th>
          <th>Product Description</th>
          <th class="center" style="width:60px">Qty</th>
          <th class="right" style="width:110px">Unit Price</th>
          <th class="right" style="width:120px">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <!-- TOTALS -->
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>Rs. ${(order.itemsPrice || 0).toLocaleString()}</span></div>
      <div class="totals-row"><span>Delivery Charges</span><span>Rs. ${(order.shippingPrice ?? 250).toLocaleString()}</span></div>
      ${(order.couponDiscount || 0) > 0 ? `
        <div class="totals-row discount">
          <span>Discount (${order.couponCode || "Coupon"})</span>
          <span>− Rs. ${order.couponDiscount.toLocaleString()}</span>
        </div>` : ""}
      <div class="totals-row"><span>Grand Total</span><span>Rs. ${(order.totalPrice || 0).toLocaleString()}</span></div>
    </div>
  </div>

  <!-- PAYMENT INFO -->
  <div class="payment-row">
    <div class="payment-box">
      <div class="meta-label">Payment Method</div>
      <div class="meta-value" style="margin-top:6px">
        <strong>${order.paymentMethod || "Cash on Delivery (COD)"}</strong><br/>
        <span class="muted">Status: ${order.paymentStatus || "pending"}</span>
        ${order.paidAt ? `<br/><span class="muted">Paid on: ${new Date(order.paidAt).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})}</span>` : ""}
      </div>
    </div>
    <div class="payment-box">
      <div class="meta-label">Order Timeline</div>
      <div class="meta-value" style="margin-top:6px">
        <span class="muted">Placed:</span> ${orderDate}<br/>
        <span class="muted">Delivered:</span> ${deliveredDate}<br/>
        <span class="muted">Items:</span> ${order.orderItems?.length || 0} product(s)
      </div>
    </div>
    ${order.note ? `
    <div class="payment-box">
      <div class="meta-label">Order Note</div>
      <div class="meta-value" style="margin-top:6px">${order.note}</div>
    </div>` : ""}
  </div>

  ${invoiceNote ? `
  <div class="notes">
    <div class="notes-label">📋 Terms & Note</div>
    <div class="notes-text">${invoiceNote}</div>
  </div>` : ""}

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      <div class="thankyou">🎉 ${thankYou}</div>
      ${bPhone ? `<div>📞 ${bPhone}</div>` : ""}
      ${bEmail ? `<div>✉️ ${bEmail}</div>` : ""}
    </div>
    <div class="footer-right">
      <div style="font-weight:700;margin-bottom:4px">${brand}</div>
      <div>${footerNote}</div>
      <div style="margin-top:8px;color:#6b7280">Printed: ${new Date().toLocaleString("en-PK")}</div>
    </div>
  </div>

  </div>
  </div>
  </div>
</body>
</html>`);
  win.document.close();
}


export default function OrderList() {
  const { settings, fetchSettings } = useSettings();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("processing");

  // Always fetch fresh settings so invoice fields are up-to-date
  useEffect(() => { fetchSettings(); }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      if (data.success) setOrders(data.orders);
    } catch { toast.error("Orders load error"); }
    finally { setLoading(false); }

  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      if (data.success) {
        toast.success(`Status → ${status}`);
        setOrders((prev) => prev.map((o) => o._id === id ? { ...o, orderStatus: status } : o));
      }
    } catch { toast.error("Update fail"); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Order delete karo?")) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted");
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch { toast.error("Delete fail"); }
  };

  const bulkUpdate = async () => {
    if (!selected.length) return toast.warn("Koi order select nahi");
    try {
      await api.put("/orders/bulk-status", { orderIds: selected, status: bulkStatus });
      toast.success(`${selected.length} orders → ${bulkStatus}`);
      setOrders((prev) => prev.map((o) => selected.includes(o._id) ? { ...o, orderStatus: bulkStatus } : o));
      setSelected([]);
    } catch { toast.error("Bulk update fail"); }
  };

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll    = () => setSelected(filtered.map((o) => o._id));
  const clearSelect  = () => setSelected([]);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.orderStatus === s).length;
    return acc;
  }, {});

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "all" ? true : filter === "guest" ? !o.user : o.orderStatus === filter;
    if (!matchFilter) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(s) ||
      getName(o).toLowerCase().includes(s) ||
      getPhone(o).toLowerCase().includes(s) ||
      getEmail(o).toLowerCase().includes(s)
    );
  });

  const totalRevenue = filtered
    .filter((o) => o.orderStatus === "delivered")
    .reduce((s, o) => s + (o.totalPrice || 0), 0);

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="section-label mb-1">Management</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">All Orders</h2>
          <p className="text-[#444] text-sm mt-1">
            {filtered.length} orders · Delivered revenue:
            <span className="text-[#c9a84c] font-bold ml-1">Rs. {totalRevenue.toLocaleString()}</span>
          </p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 text-xs text-[#555] border border-[#1a1a1a] px-3 py-2.5 rounded-xl hover:text-white hover:border-[#333] transition-all">
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order ID, customer name, phone ya email se search karo..."
          className="lux-input pl-11"
          style={{ padding: "12px 16px 12px 42px" }}
        />
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",       label: `All (${orders.length})` },
          { key: "pending",   label: `Pending (${counts.pending || 0})` },
          { key: "processing",label: `Packing (${counts.processing || 0})` },
          { key: "shipped",   label: `Shipped (${counts.shipped || 0})` },
          { key: "delivered", label: `Delivered (${counts.delivered || 0})` },
          { key: "cancelled", label: `Cancelled (${counts.cancelled || 0})` },
          { key: "guest",     label: `Guest` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filter === key ? "gold-gradient text-black" : "border border-[#1a1a1a] text-[#555] hover:border-[#333] hover:text-white"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 bg-[#0c0c0c] border border-[#c9a84c]/20 rounded-2xl px-5 py-3">
          <span className="text-[#c9a84c] text-sm font-bold">{selected.length} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            className="lux-select text-xs" style={{ padding: "7px 32px 7px 12px", fontSize: "0.78rem" }}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={bulkUpdate} className="btn-gold text-xs" style={{ padding: "8px 16px", fontSize: "0.78rem" }}>
            Apply to All
          </button>
          <button onClick={clearSelect} className="text-xs text-[#555] hover:text-white transition-colors ml-auto">
            Deselect
          </button>
        </motion.div>
      )}

      {/* ORDER TABLE */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#333] flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            Loading orders...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111] text-[#444] text-[10px] uppercase tracking-wider border-b border-[#1a1a1a]">
                  <th className="px-3 py-3">
                    <button onClick={selected.length === filtered.length ? clearSelect : selectAll}>
                      {selected.length === filtered.length && filtered.length > 0
                        ? <FiCheckSquare size={14} className="text-[#c9a84c]" />
                        : <FiSquare size={14} />}
                    </button>
                  </th>
                  {["Order ID", "Customer", "Phone", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const isOpen  = expanded === order._id;
                  const phone   = getPhone(order);
                  const email   = getEmail(order);
                  const name    = getName(order);
                  const isGuest = !order.user;
                  const st      = STATUS_STYLE[order.orderStatus] || STATUS_STYLE.pending;

                  return (
                    <>
                      <motion.tr key={order._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.015 }}
                        className={`border-t border-[#111] cursor-pointer transition-colors ${isOpen ? "bg-[#111]" : "hover:bg-[rgba(255,255,255,0.02)]"}`}
                        onClick={() => setExpanded(isOpen ? null : order._id)}>

                        {/* CHECKBOX */}
                        <td className="px-3 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(order._id); }}>
                          {selected.includes(order._id)
                            ? <FiCheckSquare size={14} className="text-[#c9a84c]" />
                            : <FiSquare size={14} className="text-[#333]" />}
                        </td>

                        {/* ORDER ID */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {isOpen ? <FiChevronUp size={12} className="text-[#c9a84c]" /> : <FiChevronDown size={12} className="text-[#333]" />}
                            <span className="text-[#555] font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</span>
                          </div>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium whitespace-nowrap">{name}</p>
                              {isGuest && <span className="text-[9px] bg-[#1a1a1a] border border-[#2a2a2a] text-[#555] px-1.5 py-0.5 rounded uppercase tracking-wider">Guest</span>}
                            </div>
                          </div>
                        </td>

                        {/* PHONE */}
                        <td className="px-4 py-4">
                          <a href={phone ? `tel:${phone}` : undefined}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-center gap-1.5 text-sm font-mono whitespace-nowrap ${phone ? "text-[#25d366] hover:text-green-300" : "text-[#333]"}`}>
                            <FiPhone size={11} /> {phone || "—"}
                          </a>
                        </td>

                        {/* ITEMS */}
                        <td className="px-4 py-4 text-[#555] text-sm">{order.orderItems?.length || 0}</td>

                        {/* TOTAL */}
                        <td className="px-4 py-4">
                          <span className="text-[#c9a84c] font-bold font-display whitespace-nowrap">
                            Rs. {(order.totalPrice || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <select value={order.orderStatus}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="lux-select text-xs"
                            style={{ padding: "6px 28px 6px 10px", fontSize: "0.74rem", width: "120px",
                              color: st.text, borderColor: st.border }}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>

                        {/* DATE */}
                        <td className="px-4 py-4 text-[#444] text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {phone && (
                              <a href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Salaam! Aapka order #${order._id.slice(-8).toUpperCase()} ka update dena tha.`)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                style={{ background: "rgba(37,211,102,0.1)", color: "#25d366" }}
                                title="WhatsApp">
                                <FiMessageCircle size={13} />
                              </a>
                            )}
                            <button onClick={() => printInvoice(order, settings)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-all"
                              title="Print Invoice">
                              <FiPrinter size={13} />
                            </button>
                            <button onClick={() => deleteOrder(order._id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#333] hover:text-red-400 hover:bg-red-900/10 transition-all"
                              title="Delete">
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      {/* EXPANDED DETAIL */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.tr key={`${order._id}-detail`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <td colSpan={9} className="bg-[#090909] border-t border-[#1a1a1a] px-6 py-5">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                {/* CONTACT */}
                                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
                                  <p className="text-[#444] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                    <FiUser size={11} /> Contact Info
                                  </p>
                                  <div>
                                    <p className="text-[#555] text-[10px] uppercase tracking-wider">Name</p>
                                    <p className="text-white text-sm font-medium">{name}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#555] text-[10px] uppercase tracking-wider">Phone</p>
                                    <a href={`tel:${phone}`} className="text-[#25d366] text-sm font-mono flex items-center gap-1.5 hover:underline">
                                      <FiPhone size={12} /> {phone || "—"}
                                    </a>
                                  </div>
                                  <div>
                                    <p className="text-[#555] text-[10px] uppercase tracking-wider">Email</p>
                                    <a href={`mailto:${email}`} className="text-[#60a5fa] text-sm flex items-center gap-1.5 hover:underline break-all">
                                      <FiMail size={12} /> {email || "—"}
                                    </a>
                                  </div>
                                  {phone && (
                                    <a href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Salaam! Order #${order._id.slice(-8).toUpperCase()} ka update dena tha.`)}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-xs font-semibold py-2 px-3 rounded-xl transition-all"
                                      style={{ background: "rgba(37,211,102,0.1)", color: "#25d366", border: "1px solid rgba(37,211,102,0.2)" }}>
                                      <FiMessageCircle size={12} /> WhatsApp karo
                                    </a>
                                  )}
                                </div>

                                {/* ADDRESS */}
                                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
                                  <p className="text-[#444] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                    <FiMapPin size={11} /> Delivery Address
                                  </p>
                                  {order.shippingAddress ? (
                                    <>
                                      <div>
                                        <p className="text-[#555] text-[10px] uppercase tracking-wider">Name</p>
                                        <p className="text-white text-sm">{order.shippingAddress.fullName}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#555] text-[10px] uppercase tracking-wider">Address</p>
                                        <p className="text-[#9a9a9a] text-sm">{order.shippingAddress.address}</p>
                                      </div>
                                      <div className="flex gap-4">
                                        <div>
                                          <p className="text-[#555] text-[10px] uppercase tracking-wider">City</p>
                                          <p className="text-white text-sm">{order.shippingAddress.city}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#555] text-[10px] uppercase tracking-wider">Province</p>
                                          <p className="text-white text-sm">{order.shippingAddress.province}</p>
                                        </div>
                                      </div>
                                    </>
                                  ) : <p className="text-[#333] text-sm">No address</p>}
                                </div>

                                {/* ITEMS */}
                                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-[#444] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                      <FiPackage size={11} /> Items
                                    </p>
                                    <button onClick={() => printInvoice(order, settings)}
                                      className="flex items-center gap-1 text-[10px] text-[#555] hover:text-white transition-colors">
                                      <FiPrinter size={11} /> Print
                                    </button>
                                  </div>
                                  <div className="space-y-2 max-h-44 overflow-y-auto">
                                    {order.orderItems?.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#222] flex-shrink-0 overflow-hidden">
                                          {item.image
                                            ? <img src={`${SERVER_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                                            : <div className="w-full h-full flex items-center justify-center text-[#333]"><FiPackage size={14} /></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                          <p className="text-[#444] text-[10px]">{[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}</p>
                                        </div>
                                        <span className="text-[#c9a84c] text-xs font-bold whitespace-nowrap">
                                          Rs. {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t border-[#1a1a1a] mt-3 pt-3 space-y-1 text-xs">
                                    <div className="flex justify-between text-[#555]"><span>Subtotal</span><span>Rs. {(order.itemsPrice||0).toLocaleString()}</span></div>
                                    <div className="flex justify-between text-[#555]"><span>Delivery</span><span>Rs. {order.shippingPrice ?? 250}</span></div>
                                    {(order.couponDiscount || 0) > 0 && (
                                      <div className="flex justify-between text-green-400"><span>Discount ({order.couponCode})</span><span>- Rs. {order.couponDiscount.toLocaleString()}</span></div>
                                    )}
                                    <div className="flex justify-between text-white font-bold pt-1 border-t border-[#1a1a1a]">
                                      <span>Total</span>
                                      <span className="text-[#c9a84c]">Rs. {(order.totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={9} className="px-6 py-14 text-center text-[#333]">Koi order nahi mila</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-right text-[#444] text-xs">
        Showing {filtered.length} of {orders.length} orders
      </div>
    </div>
  );
}
