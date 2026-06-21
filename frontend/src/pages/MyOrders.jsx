import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  FiPackage, FiClock, FiTruck, FiCheckCircle,
  FiXCircle, FiChevronDown, FiChevronUp, FiArrowLeft,
  FiAlertCircle, FiTrash2, FiDownload
} from "react-icons/fi";
import { toast } from "react-toastify";
import { SERVER_URL } from "../services/api";

const API_BASE = SERVER_URL;

const STATUS = {
  pending:    { label: "Order Received",  urdu: "آرڈر مل گیا",     color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",  Icon: FiClock,        step: 1 },
  processing: { label: "Packing",         urdu: "پیکنگ ہو رہی ہے", color: "var(--gold)", bg: "var(--gold-8)", border: "var(--gold-20)",  Icon: FiPackage,      step: 2 },
  shipped:    { label: "On the Way",      urdu: "راستے میں ہے",    color: "#818cf8", bg: "rgba(129,140,248,0.08)",border: "rgba(129,140,248,0.2)", Icon: FiTruck,        step: 3 },
  delivered:  { label: "Delivered",       urdu: "پہنچ گیا",        color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)",  Icon: FiCheckCircle,  step: 4 },
  cancelled:  { label: "Cancelled",       urdu: "کینسل ہو گیا",    color: "#f87171", bg: "rgba(248,113,113,0.08)",border: "rgba(248,113,113,0.2)", Icon: FiXCircle,      step: 0 },
};

const STEPS = ["pending", "processing", "shipped", "delivered"];

function downloadOrderInvoice(order) {
  const addr = order.shippingAddress;
  const name = addr?.fullName || "Customer";
  const phone = addr?.phone || "";
  const invoiceNo = order._id.slice(-10).toUpperCase();
  const orderId   = order._id.slice(-8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric"
  });
  const printDate = new Date().toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric"
  });

  const statusColor = {
    pending: "#f59e0b", processing: "#c9a84c",
    shipped: "#818cf8", delivered: "#16a34a",
    cancelled: "#ef4444",
  }[order.orderStatus] || "#888";

  const statusLabel = {
    pending: "Order Received", processing: "Packing",
    shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
  }[order.orderStatus] || order.orderStatus;

  const itemRows = (order.orderItems || []).map((item, i) => {
    const variant = [item.size, item.color].filter(Boolean).join(", ");
    const lineTotal = (item.price * item.quantity).toLocaleString();
    return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#888;font-size:12px;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;">
        <div style="font-weight:600;color:#1a1208;font-size:13px;">${item.name}</div>
        ${variant ? `<div style="font-size:11px;color:#9e8a6a;margin-top:2px;">${variant}</div>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:center;font-weight:600;color:#1a1208;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:right;color:#5a4a30;">Rs. ${item.price.toLocaleString()}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:right;font-weight:700;color:#c9a84c;">Rs. ${lineTotal}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${invoiceNo} - Urban Threads</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; background: #faf8f4; color: #1a1208; font-size: 13px; }
    .page { max-width: 780px; margin: 0 auto; background: #ffffff; }
    .inv-header { background: linear-gradient(135deg, #1a1208 0%, #2d2010 60%, #3d2e14 100%); padding: 36px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand-name { font-size: 26px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; }
    .brand-tagline { font-size: 10px; color: rgba(201,168,76,0.6); letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
    .inv-title-block { text-align: right; }
    .inv-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 3px; text-transform: uppercase; }
    .inv-number { font-size: 22px; font-weight: 800; color: #c9a84c; margin-top: 4px; }
    .inv-date { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 6px; }
    .status-bar { background: #f7f3ec; border-bottom: 2px solid #e8e0d0; padding: 12px 40px; display: flex; align-items: center; justify-content: space-between; }
    .status-pill { display: inline-flex; align-items: center; gap: 7px; background: ${statusColor}22; border: 1.5px solid ${statusColor}55; color: ${statusColor}; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: ${statusColor}; }
    .payment-badge { background: #1a120808; border: 1px solid #c9a84c44; color: #8a6f3a; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .meta-section { padding: 28px 40px 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .meta-card { background: #faf8f4; border: 1px solid #e8e0d0; border-radius: 8px; padding: 16px 18px; }
    .meta-card-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #9e8a6a; margin-bottom: 10px; border-bottom: 1px solid #e8e0d0; padding-bottom: 7px; }
    .meta-card-name { font-size: 14px; font-weight: 700; color: #1a1208; margin-bottom: 4px; }
    .meta-card-line { font-size: 12px; color: #6a5a3a; margin-bottom: 2px; line-height: 1.5; }
    .items-section { padding: 24px 40px 0; }
    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #9e8a6a; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e8e0d0; border-radius: 8px; overflow: hidden; }
    thead tr { background: #2d2010; }
    thead th { padding: 11px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #c9a84c; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) { background: #fdf9f3; }
    .totals-section { padding: 20px 40px 0; display: flex; justify-content: flex-end; }
    .totals-box { width: 280px; border: 1px solid #e8e0d0; border-radius: 8px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: 9px 16px; border-bottom: 1px solid #f0ebe0; font-size: 12px; }
    .totals-row .label { color: #6a5a3a; }
    .totals-row .val { color: #1a1208; font-weight: 500; }
    .totals-row.discount .val { color: #16a34a; }
    .totals-grand { display: flex; justify-content: space-between; padding: 13px 16px; background: #2d2010; }
    .totals-grand .label { color: #c9a84c; font-weight: 700; font-size: 13px; }
    .totals-grand .val { color: #c9a84c; font-weight: 800; font-size: 15px; }
    .inv-footer { padding: 24px 40px 30px; margin-top: 24px; border-top: 1px solid #e8e0d0; display: flex; justify-content: space-between; align-items: center; }
    .footer-msg { font-size: 12px; color: #9e8a6a; }
    .footer-msg strong { color: #c9a84c; }
    .footer-print { font-size: 10px; color: #b8a898; text-align: right; }
    @media print {
      body { background: #fff; }
      .page { max-width: 100%; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="inv-header">
    <div>
      <div class="brand-name">Urban Threads</div>
      <div class="brand-tagline">Premium Fashion Pakistan</div>
    </div>
    <div class="inv-title-block">
      <div class="inv-title">Invoice</div>
      <div class="inv-number">#${invoiceNo}</div>
      <div class="inv-date">${orderDate}</div>
    </div>
  </div>
  <div class="status-bar">
    <div class="status-pill"><span class="status-dot"></span>${statusLabel}</div>
    <div class="payment-badge">Payment: ${order.paymentMethod || "COD"}</div>
  </div>
  <div class="meta-section">
    <div class="meta-card">
      <div class="meta-card-label">Bill To</div>
      <div class="meta-card-name">${name}</div>
      ${phone ? `<div class="meta-card-line">📞 ${phone}</div>` : ""}
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Ship To</div>
      ${addr ? `
        <div class="meta-card-name">${addr.fullName}</div>
        <div class="meta-card-line">${addr.address}</div>
        <div class="meta-card-line">${addr.city}${addr.province ? ", " + addr.province : ""}</div>
      ` : "<div class=\"meta-card-line\">—</div>"}
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Order Info</div>
      <div class="meta-card-line"><strong>Order ID:</strong> #${orderId}</div>
      <div class="meta-card-line"><strong>Date:</strong> ${orderDate}</div>
      <div class="meta-card-line"><strong>Items:</strong> ${(order.orderItems || []).length}</div>
    </div>
  </div>
  <div class="items-section" style="margin-top:24px;">
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th style="width:36px;">#</th>
          <th>Product</th>
          <th style="text-align:center;width:60px;">Qty</th>
          <th style="text-align:right;width:110px;">Unit Price</th>
          <th style="text-align:right;width:110px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>
  <div class="totals-section">
    <div class="totals-box">
      <div class="totals-row"><span class="label">Subtotal</span><span class="val">Rs. ${(order.itemsPrice || 0).toLocaleString()}</span></div>
      <div class="totals-row"><span class="label">Delivery Charges</span><span class="val">Rs. ${(order.shippingPrice ?? 250).toLocaleString()}</span></div>
      ${order.couponDiscount > 0 ? `<div class="totals-row discount"><span class="label">Discount (${order.couponCode || "Coupon"})</span><span class="val">− Rs. ${order.couponDiscount.toLocaleString()}</span></div>` : ""}
      <div class="totals-grand"><span class="label">Grand Total</span><span class="val">Rs. ${(order.totalPrice || 0).toLocaleString()}</span></div>
    </div>
  </div>
  <div class="inv-footer">
    <div class="footer-msg">Thank you for shopping with <strong>Urban Threads</strong>! 🌸<br/><span style="font-size:11px;">For any queries, contact us on WhatsApp.</span></div>
    <div class="footer-print">Printed on: ${printDate}<br/>Urban Threads Pakistan</div>
  </div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Pop-up blocked! Please allow pop-ups."); return; }
  win.document.write(html);
  win.document.close();
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Aap ye order delete karna chahte hain?")) return;
    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        toast.success("Order kamyabi se delete ho gaya");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error(err.response?.data?.message || "Order delete karne mein masla hua");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("MyOrders error:", err);
        toast.error("Orders load karne mein masla hua");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen overflow-hidden flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--bg-deep)" }}>
        <div className="text-center space-y-4 overflow-hidden">
          <FiAlertCircle size={48} className="mx-auto" style={{ color: "var(--text-muted)" }} />
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Login Zaroori Hai</h2>
          <p style={{ color: "var(--text-muted)" }}>Orders dekhne ke liye login karo</p>
          <Link to="/login" className="btn-gold inline-flex">Login karo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden pt-24 pb-16 px-4 sm:px-6"
      style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="max-w-3xl mx-auto overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8 overflow-hidden">
          <Link to="/"
            className="p-2 rounded-xl transition-all overflow-hidden"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <FiArrowLeft size={18} />
          </Link>
          <div className="overflow-hidden">
            <p className="section-label mb-0.5">My Account</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>My Orders</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3" style={{ color: "var(--text-muted)" }}>
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
              style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
              <FiPackage size={32} style={{ color: "var(--text-muted)" }} />
            </div>
            <h3 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>Koi Order Nahi Hai</h3>
            <p style={{ color: "var(--text-muted)" }}>Abhi tak koi order place nahi kiya</p>
            <Link to="/shop" className="btn-gold inline-flex">Shop Karo</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{orders.length} order{orders.length > 1 ? "s" : ""} found</p>

            {orders.map((order, i) => {
              const status = STATUS[order.orderStatus] || STATUS.pending;
              const isOpen = expanded === order._id;
              const currentStep = status.step;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                >
                  {/* ORDER HEADER */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors text-left"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: status.bg, border: `1px solid ${status.border}` }}
                      >
                        <status.Icon size={18} style={{ color: status.color }} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="gold-text font-bold font-display text-sm">
                            Rs. {order.totalPrice?.toLocaleString()}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {order.orderItems?.length} item{order.orderItems?.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isOpen
                      ? <FiChevronUp size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      : <FiChevronDown size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    }
                  </button>

                  {/* ORDER DETAIL (expanded) */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        transition={{ duration: 0.3 }} className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-5" style={{ borderTop: "1px solid var(--border)" }}>

                          {/* STATUS STEPPER */}
                          {order.orderStatus !== "cancelled" && (
                            <div className="pt-5">
                              <div className="flex items-center justify-between relative">
                                <div className="absolute top-4 left-4 right-4 h-0.5" style={{ background: "var(--border)" }} />
                                <div
                                  className="absolute top-4 left-4 h-0.5 transition-all duration-700 gold-gradient"
                                  style={{ width: `${Math.max(0, ((currentStep - 1) / 3) * 100)}%`, right: "auto" }}
                                />

                                {STEPS.map((step, idx) => {
                                  const s = STATUS[step];
                                  const done = currentStep > idx + 1;
                                  const active = currentStep === idx + 1;
                                  return (
                                    <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
                                      <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                                        style={{
                                          background: done || active ? s.color : "var(--bg-surface)",
                                          borderColor: done || active ? s.color : "var(--border)",
                                        }}
                                      >
                                        <s.Icon size={13} color={done || active ? "#000" : "var(--text-muted)"} />
                                      </div>
                                      <span className="text-[9px] text-center leading-tight max-w-13"
                                        style={{ color: done || active ? "var(--text-primary)" : "var(--text-muted)", fontWeight: done || active ? 600 : 400 }}>
                                        {s.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-5 text-center py-3 rounded-xl"
                                style={{ background: status.bg, border: `1px solid ${status.border}` }}>
                                <p className="text-sm font-semibold" style={{ color: status.color }}>
                                  {status.Icon && <status.Icon className="inline mr-2" size={14} />}
                                  {status.label} — <span style={{ fontFamily: "serif" }}>{status.urdu}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          {/* CANCELLED */}
                          {order.orderStatus === "cancelled" && (
                            <div className="mt-4 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                              <p className="text-red-400 font-semibold text-sm">Order Cancel Ho Gaya ❌</p>
                            </div>
                          )}

                          {/* ORDER ITEMS */}
                          <div>
                            <h4 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Order Items</h4>
                            <div className="space-y-2">
                              {order.orderItems?.map((item, j) => (
                                <div key={j} className="flex items-center justify-between rounded-xl px-4 py-3"
                                  style={{ background: "var(--bg-elevated)" }}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                      style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
                                      <FiPackage size={14} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <span className="gold-text font-semibold text-sm">
                                    Rs. {(item.price * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* PRICE BREAKDOWN */}
                          <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--bg-elevated)" }}>
                            <div className="flex justify-between text-sm" style={{ color: "var(--text-muted)" }}>
                              <span>Items Total</span>
                              <span style={{ color: "var(--text-primary)" }}>Rs. {order.itemsPrice?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm" style={{ color: "var(--text-muted)" }}>
                              <span>Delivery</span>
                              <span style={{ color: "var(--text-primary)" }}>Rs. {(order.totalPrice - order.itemsPrice)?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold pt-2"
                              style={{ borderTop: "1px solid var(--border)" }}>
                              <span style={{ color: "var(--text-primary)" }}>Total</span>
                              <span className="gold-text font-display text-base">Rs. {order.totalPrice?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1" style={{ color: "var(--text-muted)" }}>
                              <span>Payment</span>
                              <span className="px-2 py-0.5 rounded"
                                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                                {order.paymentMethod || "COD"}
                              </span>
                            </div>
                          </div>

                          {/* SHIPPING ADDRESS */}
                          {order.shippingAddress && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Delivery Address</h4>
                              <div className="rounded-xl p-4 text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{order.shippingAddress.fullName}</p>
                                <p className="mt-0.5">{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                <p>{order.shippingAddress.phone}</p>
                              </div>
                            </div>
                          )}

                          {/* DATES & ACTIONS */}
                          <div className="flex items-center justify-between flex-wrap gap-4 pt-3 border-t border-(--border)">
                            <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                              <span>Ordered: {new Date(order.createdAt).toLocaleString("en-PK")}</span>
                              {order.deliveredAt && (
                                <span className="text-green-500">
                                  Delivered: {new Date(order.deliveredAt).toLocaleString("en-PK")}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => downloadOrderInvoice(order)}
                                className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                style={{ color: "var(--gold)", border: "1px solid var(--gold-20)", background: "var(--gold-8)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--gold-20)"}
                                onMouseLeave={e => e.currentTarget.style.background = "var(--gold-8)"}
                              >
                                <FiDownload size={13} />
                                Invoice PDF
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order._id)}
                                className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10 cursor-pointer"
                              >
                                <FiTrash2 size={13} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
