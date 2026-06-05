import React, { useState, useEffect, useCallback } from "react";
import api, { SERVER_URL } from "../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../context/SettingsContext";
import {
  FiRefreshCw, FiPhone, FiMail, FiMapPin, FiSearch,
  FiChevronDown, FiChevronUp, FiPackage, FiUser,
  FiTrash2, FiMessageCircle, FiPrinter, FiCheckSquare,
  FiSquare, FiDownload, FiClock
} from "react-icons/fi";
import LazyImage from "../../components/LazyImage";
import { getCartImageUrl } from "../../utils/cloudinaryOptimized";

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

const getWhatsAppMessageLink = (order) => {
  const phone = getPhone(order);
  if (!phone) return "";
  
  const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "92");
  const name = getName(order);
  const orderId = order._id.slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  
  const paymentMethod = order.paymentMethod || "COD";
  
  let address = "N/A";
  if (order.shippingAddress) {
    const parts = [
      order.shippingAddress.address,
      order.shippingAddress.city,
      order.shippingAddress.province
    ].filter(Boolean);
    address = parts.join(", ");
  }

  const itemsList = (order.orderItems || [])
    .map((item) => {
      const variant = [item.size, item.color].filter(Boolean).join(", ");
      return `• *${item.name}*${variant ? ` (${variant})` : ""} - Qty: ${item.quantity} - Rs. ${item.price.toLocaleString()}`;
    })
    .join("\n");
  
  const text = `Assalam-o-Alaikum! 🌸

Aapka Order mil gaya hai aur process kiya ja raha hai. Details ye hain:

📋 *Order Details:*
- *Order ID:* #${orderId}
- *Date:* ${date}
- *Status:* ${order.orderStatus.toUpperCase()}
- *Payment Method:* ${paymentMethod}

👤 *Customer Details:*
- *Name:* ${name}
- *Phone:* ${phone}
- *Address:* ${address}

📦 *Items Ordered:*
${itemsList}

💵 *Payment Summary:*
- *Subtotal:* Rs. ${(order.itemsPrice || 0).toLocaleString()}
- *Delivery Charges:* Rs. ${(order.shippingPrice ?? 250).toLocaleString()}
${order.couponDiscount ? `- *Discount:* - Rs. ${order.couponDiscount.toLocaleString()}\n` : ""}- *Grand Total:* Rs. ${(order.totalPrice || 0).toLocaleString()}

Shukriya for shopping with Urban Threads! ❤️`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {status}
    </span>
  );
}

function printInvoice(order) {
  const name = getName(order);
  const phone = getPhone(order);
  const email = getEmail(order);
  const addr = order.shippingAddress;
  const invoiceNo = order._id.slice(-10).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric"
  });

  const statusColor = {
    pending: "#f59e0b", processing: "#c9a84c",
    shipped: "#818cf8", delivered: "#16a34a",
    cancelled: "#ef4444",
  }[order.orderStatus] || "#555";

  const itemRows = (order.orderItems || []).map((item, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td class="name">${item.name}${item.size ? ` (${item.size}` : ""}${item.color ? `, ${item.color}` : ""}${item.size || item.color ? ")" : ""}</td>
      <td class="center">${item.quantity}</td>
      <td class="right">Rs. ${item.price}</td>
      <td class="right">Rs. ${item.price * item.quantity}</td>
    </tr>`).join("");

  const win = window.open("", "_blank", "width=800,height=600");
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${invoiceNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
    .page-container { display: grid; grid-template-columns: 1fr 1fr; gap: 0; height: 100%; }
    .invoice { border: 1px dashed #ccc; padding: 12px; page-break-inside: avoid; height: 50vh; display: flex; flex-direction: column; }
    .header { border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; }
    .brand { font-size: 13px; font-weight: bold; text-transform: uppercase; }
    .inv-info { text-align: right; font-size: 10px; }
    .inv-no { font-weight: bold; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; font-size: 10px; }
    .meta-box { border: 1px solid #ddd; padding: 4px; background: #f9f9f9; }
    .meta-label { font-weight: bold; font-size: 9px; text-transform: uppercase; color: #666; }
    .meta-val { margin-top: 2px; word-break: break-word; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10px; }
    thead { background: #f0f0f0; }
    th { padding: 3px; text-align: left; font-weight: bold; border-bottom: 1px solid #ddd; }
    td { padding: 2px 3px; border-bottom: 1px solid #eee; }
    .num { width: 20px; }
    .center { text-align: center; width: 35px; }
    .right { text-align: right; width: 70px; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 6px; }
    .totals-box { width: 140px; font-size: 10px; }
    .totals-row { display: flex; justify-content: space-between; padding: 2px 4px; border-bottom: 1px solid #eee; }
    .totals-row.total { border-top: 1px solid #000; font-weight: bold; background: #f0f0f0; }
    .footer { font-size: 9px; color: #666; text-align: center; margin-top: auto; border-top: 1px solid #ddd; padding-top: 4px; }
    @media print { .invoice { page-break-inside: avoid; border: none; padding: 0; } }
  </style>
</head>
<body>
<div class="page-container">
  <div class="invoice">
    <div class="header">
      <div class="brand">URBAN THREAD</div>
      <div class="inv-info">
        <div class="inv-no">INV #${invoiceNo}</div>
        <div>${orderDate}</div>
        <div><span style="display: inline-block; background: ${statusColor}; color: white; padding: 1px 4px; border-radius: 2px; font-size: 9px; margin-top: 2px;">${order.orderStatus}</span></div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Bill To</div>
        <div class="meta-val"><strong>${name}</strong><br/>${phone ? phone + "<br/>" : ""}${email || ""}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Ship To</div>
        <div class="meta-val">${addr ? `<strong>${addr.fullName}</strong><br/>${addr.address}<br/>${addr.city}` : "—"}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="num">#</th>
          <th>Item</th>
          <th class="center">Qty</th>
          <th class="right">Price</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal:</span><span>Rs. ${order.itemsPrice || 0}</span></div>
        <div class="totals-row"><span>Delivery:</span><span>Rs. ${order.shippingPrice ?? 250}</span></div>
        ${order.couponDiscount ? `<div class="totals-row"><span>Discount:</span><span>- Rs. ${order.couponDiscount}</span></div>` : ""}
        <div class="totals-row total"><span>Total:</span><span>Rs. ${order.totalPrice || 0}</span></div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your order!</p>
      <p style="margin-top: 3px;">Payment: ${order.paymentMethod || "COD"}</p>
    </div>
  </div>
</div>
</body>
</html>`);
  win.document.close();
}

function printShippingLabel(order) {
  const name = getName(order);
  const phone = getPhone(order);
  const addr = order.shippingAddress;
  const orderNo = order._id.slice(-10).toUpperCase();
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-PK");

  const win = window.open("", "_blank", "width=600,height=400");
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Shipping Label #${orderNo}</title>
  <style>
    body { font-family: monospace; font-size: 14px; margin: 20px; color: #000; }
    .label-box { border: 4px solid #000; padding: 15px; max-width: 450px; margin: 0 auto; }
    .title { font-size: 20px; font-weight: bold; text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
    .section { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
    .label { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #555; }
    .val { font-size: 16px; margin-top: 3px; }
    .row { display: flex; justify-content: space-between; }
    .barcode { font-size: 24px; letter-spacing: 5px; text-align: center; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="label-box">
    <div class="title">URBAN THREADS SHIPMENT</div>
    <div class="section">
      <div class="label">TO:</div>
      <div class="val"><strong>${addr?.fullName || name}</strong></div>
      <div class="val">${addr?.address || "N/A"}</div>
      <div class="val">${addr?.city || "N/A"}, Pakistan</div>
    </div>
    <div class="section">
      <div class="row">
        <div>
          <div class="label">ORDER NUMBER</div>
          <div class="val"><strong>#${orderNo}</strong></div>
        </div>
        <div>
          <div class="label">PHONE</div>
          <div class="val"><strong>${phone}</strong></div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="row">
        <div>
          <div class="label">CARRIER</div>
          <div class="val">${order.courierPartner || "COD (Leopard/TCS)"}</div>
        </div>
        <div>
          <div class="label">TOTAL CHARGES</div>
          <div class="val"><strong>Rs. ${order.totalPrice?.toLocaleString()}</strong></div>
        </div>
      </div>
    </div>
    <div class="barcode">||||| | ||||| | ||||| | ||</div>
  </div>
  <script>window.print();</script>
</body>
</html>`);
  win.document.close();
}

export default function OrderList() {
  const { fetchSettings } = useSettings();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("processing");

  // Always fetch fresh settings so invoice fields are up-to-date
  useEffect(() => { fetchSettings(); }, [fetchSettings]);

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
    if (!window.confirm("Delete order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted");
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch { toast.error("Delete fail"); }
  };

  /* CSV EXPORT */
  const exportCSV = () => {
    const rows = [
      ["Order ID", "Customer", "Phone", "Email", "Status", "Items", "Total", "Payment", "Date"],
      ...filtered.map((o) => [
        `#${o._id.slice(-10).toUpperCase()}`,
        getName(o),
        getPhone(o),
        getEmail(o),
        o.orderStatus,
        o.orderItems?.length || 0,
        o.totalPrice || 0,
        o.paymentMethod || "COD",
        new Date(o.createdAt).toLocaleDateString("en-PK"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} orders`);
  };

  const bulkUpdate = async () => {
    if (!selected.length) return toast.warn("No orders selected");
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
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-(--text-primary)">All Orders</h2>
          <p className="text-(--text-muted) text-sm mt-1">
            {filtered.length} orders · Delivered revenue:
            <span className="text-(--gold) font-bold ml-1">Rs. {totalRevenue.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 text-xs text-green-500 border border-green-500/30 px-3 py-2.5 rounded-xl hover:bg-green-500/10 transition-all">
            <FiDownload size={13} /> Export CSV
          </button>
          <button onClick={fetchOrders}
            className="flex items-center gap-2 text-xs text-(--text-muted) border border-(--border) px-3 py-2.5 rounded-xl hover:text-(--text-primary) hover:border-(--border-light) transition-all">
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Order ID, customer name, phone, or email..."
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
              filter === key ? "gold-gradient text-black shadow-lg" : "border border-(--border) text-(--text-muted) hover:border-(--border-light) hover:text-(--text-primary)"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 bg-(--bg-card) border border-(--gold)/20 rounded-2xl px-5 py-3 shadow-xl">
          <span className="text-(--gold) text-sm font-bold">{selected.length} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            className="lux-select text-xs" style={{ padding: "7px 32px 7px 12px", fontSize: "0.78rem" }}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={bulkUpdate} className="btn-gold text-xs" style={{ padding: "8px 16px", fontSize: "0.78rem" }}>
            Apply to All
          </button>
          <button onClick={clearSelect} className="text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors ml-auto">
            Deselect
          </button>
        </motion.div>
      )}

      {/* ORDER TABLE */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-(--text-muted) flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
            Loading orders...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-(--bg-surface) text-(--text-muted) text-[10px] uppercase tracking-wider border-b border-(--border)">
                  <th className="px-3 py-3">
                    <button onClick={selected.length === filtered.length ? clearSelect : selectAll}>
                      {selected.length === filtered.length && filtered.length > 0
                        ? <FiCheckSquare size={14} className="text-(--gold)" />
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
                    <React.Fragment key={order._id}>
                      <motion.tr key={order._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.015 }}
                        className={`border-t border-(--border) cursor-pointer transition-colors ${isOpen ? "bg-(--bg-surface)" : "hover:bg-(--bg-elevated)/30"}`}
                        onClick={() => setExpanded(isOpen ? null : order._id)}>

                        {/* CHECKBOX */}
                        <td className="px-3 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(order._id); }}>
                          {selected.includes(order._id)
                            ? <FiCheckSquare size={14} className="text-(--gold)" />
                            : <FiSquare size={14} className="text-(--border-light)" />}
                        </td>

                        {/* ORDER ID */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {isOpen ? <FiChevronUp size={12} className="text-(--gold)" /> : <FiChevronDown size={12} className="text-(--text-muted)" />}
                            <span className="text-(--text-muted) font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</span>
                          </div>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-black text-xs font-bold shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-(--text-primary) text-sm font-medium whitespace-nowrap">{name}</p>
                              {isGuest && <span className="text-[9px] bg-(--bg-surface) border border-(--border) text-(--text-muted) px-1.5 py-0.5 rounded uppercase tracking-wider">Guest</span>}
                            </div>
                          </div>
                        </td>

                        {/* PHONE */}
                        <td className="px-4 py-4">
                          <a href={phone ? `tel:${phone}` : undefined}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-center gap-1.5 text-sm font-mono whitespace-nowrap ${phone ? "text-[#16a34a] hover:text-[#22c55e]" : "text-(--text-muted)"}`}>
                            <FiPhone size={11} /> {phone || "—"}
                          </a>
                        </td>

                        {/* ITEMS */}
                        <td className="px-4 py-4 text-(--text-muted) text-sm">{order.orderItems?.length || 0}</td>

                        {/* TOTAL */}
                        <td className="px-4 py-4">
                          <span className="text-(--gold) font-bold font-display whitespace-nowrap">
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
                        <td className="px-4 py-4 text-(--text-muted) text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {phone && (
                              <a href={getWhatsAppMessageLink(order)}
                                target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}
                                title="WhatsApp">
                                <FiMessageCircle size={13} />
                              </a>
                            )}
                            <button onClick={() => deleteOrder(order._id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-all"
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
                            <td colSpan={9} className="bg-(--bg-deep) border-t border-(--border) px-6 py-5">
                              <div className="space-y-4">
                                {/* ORDER HEADER */}
                                <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-5">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                      <p className="text-(--text-muted) text-[10px] uppercase tracking-wider mb-1">Order ID</p>
                                      <p className="text-(--text-primary) font-bold text-sm">#{order._id.slice(-10).toUpperCase()}</p>
                                    </div>
                                    <div>
                                      <p className="text-(--text-muted) text-[10px] uppercase tracking-wider mb-1">Date</p>
                                      <p className="text-(--text-primary) text-sm">{new Date(order.createdAt).toLocaleDateString("en-PK")}</p>
                                    </div>
                                    <div>
                                      <p className="text-(--text-muted) text-[10px] uppercase tracking-wider mb-1">Payment</p>
                                      <p className="text-(--text-primary) text-sm">{order.paymentMethod || "COD"}</p>
                                    </div>
                                    <div>
                                      <p className="text-(--text-muted) text-[10px] uppercase tracking-wider mb-1">Status</p>
                                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize inline-block" style={{ background: STATUS_STYLE[order.orderStatus]?.bg, border: `1px solid ${STATUS_STYLE[order.orderStatus]?.border}`, color: STATUS_STYLE[order.orderStatus]?.text }}>
                                        {order.orderStatus}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => printInvoice(order)}
                                      className="mt-4 flex-1 flex items-center justify-center gap-2 bg-(--gold) hover:bg-(--gold-light) text-black font-bold py-2.5 px-4 rounded-lg transition-all">
                                      <FiPrinter size={14} /> Print Invoice
                                    </button>
                                    <button onClick={() => printShippingLabel(order)}
                                      className="mt-4 flex-1 flex items-center justify-center gap-2 bg-(--bg-elevated) border border-(--border) hover:border-(--border-light) text-(--text-primary) font-bold py-2.5 px-4 rounded-lg transition-all">
                                      <FiPackage size={14} /> Shipping Label
                                    </button>
                                  </div>
                                </div>

                                 {/* CUSTOMER & DELIVERY INFO */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-4 space-y-2">
                                    <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                      <FiUser size={11} /> Customer
                                    </p>
                                    <div>
                                      <p className="text-(--text-muted) text-[10px]">Name</p>
                                      <p className="text-(--text-primary) text-sm font-medium">{name}</p>
                                    </div>
                                    <div>
                                      <p className="text-(--text-muted) text-[10px]">Phone</p>
                                      <div className="flex items-center gap-2">
                                        <a href={`tel:${phone}`} className="text-[#16a34a] text-sm hover:underline">{phone || "—"}</a>
                                        {phone && (
                                          <a href={getWhatsAppMessageLink(order)}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-[#16a34a] hover:scale-110 transition-transform"
                                            title="Chat on WhatsApp">
                                            <FiMessageCircle size={13} />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-(--text-muted) text-[10px]">Email</p>
                                      <a href={`mailto:${email}`} className="text-[#3b82f6] text-sm hover:underline break-all">{email || "—"}</a>
                                    </div>
                                  </div>

                                  <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-4 space-y-2">
                                    <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                      <FiMapPin size={11} /> Delivery Address
                                    </p>
                                    {order.shippingAddress ? (
                                      <>
                                        <div>
                                          <p className="text-(--text-primary) text-sm font-medium">{order.shippingAddress.fullName}</p>
                                          <p className="text-(--text-secondary) text-sm">{order.shippingAddress.address}</p>
                                        </div>
                                        <div>
                                          <p className="text-(--text-muted) text-[10px]">{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                          {order.shippingAddress.postalCode && <p className="text-(--text-muted) text-[10px]">Postal: {order.shippingAddress.postalCode}</p>}
                                        </div>
                                      </>
                                    ) : <p className="text-(--text-muted) text-sm">No address</p>}
                                  </div>

                                  <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-4 space-y-3">
                                    <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                      📦 Logistics & Returns
                                    </p>
                                    
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-(--text-muted) uppercase font-bold block">Courier & Tracking</label>
                                      <div className="flex gap-1.5">
                                        <input
                                          placeholder="Courier"
                                          value={order.courierPartner || ""}
                                          onChange={(e) => {
                                            const courier = e.target.value;
                                            setOrders(prev => prev.map(o => o._id === order._id ? { ...o, courierPartner: courier } : o));
                                          }}
                                          onBlur={async (e) => {
                                            try {
                                              await api.put(`/orders/${order._id}/tracking`, { courierPartner: e.target.value });
                                              toast.success("Courier updated!");
                                            } catch { toast.error("Fail to save"); }
                                          }}
                                          className="lux-input text-[11px] py-1 px-2 flex-1"
                                        />
                                        <input
                                          placeholder="Tracking ID"
                                          value={order.trackingNumber || ""}
                                          onChange={(e) => {
                                            const track = e.target.value;
                                            setOrders(prev => prev.map(o => o._id === order._id ? { ...o, trackingNumber: track } : o));
                                          }}
                                          onBlur={async (e) => {
                                            try {
                                              await api.put(`/orders/${order._id}/tracking`, { trackingNumber: e.target.value });
                                              toast.success("Tracking updated!");
                                            } catch { toast.error("Fail to save"); }
                                          }}
                                          className="lux-input text-[11px] py-1 px-2 flex-1"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1 pt-1 border-t border-(--border)/45">
                                      <label className="text-[10px] text-(--text-muted) uppercase font-bold block">Return Status</label>
                                      <div className="flex items-center gap-1.5">
                                        <select
                                          value={order.returnStatus || "none"}
                                          onChange={async (e) => {
                                            const status = e.target.value;
                                            try {
                                              await api.put(`/orders/${order._id}/return`, { status });
                                              toast.success(`Return status → ${status}`);
                                              setOrders(prev => prev.map(o => o._id === order._id ? { ...o, returnStatus: status } : o));
                                            } catch { toast.error("Update failed"); }
                                          }}
                                          className="lux-select text-[11px] py-1 px-2 flex-1"
                                        >
                                          <option value="none">No Return</option>
                                          <option value="requested">Return Requested</option>
                                          <option value="approved">Approved</option>
                                          <option value="rejected">Rejected</option>
                                          <option value="received">Received</option>
                                          <option value="refunded">Refunded</option>
                                        </select>
                                      </div>
                                      {order.returnReason && (
                                        <p className="text-[10px] text-yellow-400 mt-1 font-light italic">Reason: "{order.returnReason}"</p>
                                      )}
                                    </div>

                                    {order.returnStatus === "refunded" && (
                                      <div className="space-y-1 pt-1 border-t border-(--border)/45">
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block">Refund Amount (Rs.)</label>
                                        <input
                                          type="number"
                                          value={order.refundAmount || 0}
                                          onChange={(e) => {
                                            const amt = Number(e.target.value) || 0;
                                            setOrders(prev => prev.map(o => o._id === order._id ? { ...o, refundAmount: amt } : o));
                                          }}
                                          onBlur={async (e) => {
                                            try {
                                              await api.put(`/orders/${order._id}/refund`, { amount: Number(e.target.value) });
                                              toast.success("Refund processed!");
                                            } catch { toast.error("Fail to save refund"); }
                                          }}
                                          className="lux-input text-[11px] py-1 px-2 w-full"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* ITEMS TABLE */}
                                <div className="bg-(--bg-surface) border border-(--border) rounded-xl overflow-hidden">
                                  <div className="p-4 border-b border-(--border)">
                                    <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                      <FiPackage size={11} /> Order Items
                                    </p>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-(--border)">
                                          <th className="px-4 py-2 text-left text-(--text-muted) font-semibold uppercase tracking-wider">#</th>
                                          <th className="px-4 py-2 text-left text-(--text-muted) font-semibold uppercase tracking-wider">Product</th>
                                          <th className="px-4 py-2 text-left text-(--text-muted) font-semibold uppercase tracking-wider">Variant</th>
                                          <th className="px-4 py-2 text-center text-(--text-muted) font-semibold uppercase tracking-wider">Qty</th>
                                          <th className="px-4 py-2 text-right text-(--text-muted) font-semibold uppercase tracking-wider">Price</th>
                                          <th className="px-4 py-2 text-right text-(--text-muted) font-semibold uppercase tracking-wider">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.orderItems?.map((item, idx) => (
                                          <tr key={idx} className="border-b border-(--border) hover:bg-(--bg-elevated) transition-colors">
                                            <td className="px-4 py-3 text-(--text-muted)">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                              <div className="flex items-center gap-2">
                                                <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden bg-(--bg-deep) border border-(--border) aspect-square">
                                                  {item.image ? (
                                                    <LazyImage src={getCartImageUrl(item.image)} alt={item.name} className="absolute inset-0 w-full h-full object-cover object-center" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                  ) : (
                                                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-(--text-muted)"><FiPackage size={12} /></div>
                                                  )}
                                                </div>
                                                <p className="text-(--text-primary) font-medium">{item.name}</p>
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-(--text-secondary)">{[item.size, item.color].filter(Boolean).join(", ") || "—"}</td>
                                            <td className="px-4 py-3 text-center text-(--text-primary) font-medium">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-(--gold) font-semibold">Rs. {item.price.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-(--gold) font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* TOTALS */}
                                  <div className="p-4 border-t border-(--border) space-y-2">
                                    <div className="flex justify-end">
                                      <div className="w-full sm:w-60 space-y-1">
                                        <div className="flex justify-between text-(--text-muted) text-xs">
                                          <span>Subtotal</span>
                                          <span>Rs. {(order.itemsPrice || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-(--text-muted) text-xs">
                                          <span>Delivery Charges</span>
                                          <span>Rs. {(order.shippingPrice ?? 250).toLocaleString()}</span>
                                        </div>
                                        {(order.couponDiscount || 0) > 0 && (
                                          <div className="flex justify-between text-green-500 text-xs">
                                            <span>Discount ({order.couponCode})</span>
                                            <span>- Rs. {order.couponDiscount.toLocaleString()}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between text-(--text-primary) font-bold pt-2 border-t border-(--border)">
                                          <span>Grand Total</span>
                                          <span className="text-(--gold)">Rs. {(order.totalPrice || 0).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* ORDER TIMELINE */}
                                {order.orderTimeline?.length > 0 && (
                                  <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-4">
                                    <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-4">
                                      <FiClock size={11} /> Order Timeline
                                    </p>
                                    <div className="relative pl-6">
                                      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-(--border)" />
                                      <div className="space-y-4">
                                        {order.orderTimeline.map((entry, ti) => {
                                          const isLast = ti === order.orderTimeline.length - 1;
                                          const tst = STATUS_STYLE[entry.status] || STATUS_STYLE.pending;
                                          return (
                                            <div key={ti} className="relative flex items-start gap-3">
                                              <div
                                                className="absolute -left-6 mt-0.5 w-3 h-3 rounded-full border-2 shrink-0"
                                                style={{
                                                  background: isLast ? tst.text : "transparent",
                                                  borderColor: tst.text,
                                                  boxShadow: isLast ? `0 0 8px ${tst.text}60` : "none",
                                                }}
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded capitalize"
                                                    style={{ background: tst.bg, color: tst.text, border: `1px solid ${tst.border}` }}
                                                  >
                                                    {entry.status}
                                                  </span>
                                                  <span className="text-[10px] text-(--text-muted)">
                                                    {new Date(entry.timestamp).toLocaleString("en-PK", {
                                                      day: "numeric", month: "short",
                                                      hour: "2-digit", minute: "2-digit"
                                                    })}
                                                  </span>
                                                </div>
                                                {entry.note && (
                                                  <p className="text-[10px] text-(--text-muted) mt-0.5 italic">"{entry.note}"</p>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={9} className="px-6 py-14 text-center text-(--text-muted)">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-right text-(--text-muted) text-xs">
        Showing {filtered.length} of {orders.length} orders
      </div>
    </div>
  );
}
