import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  FiPackage, FiClock, FiTruck, FiCheckCircle,
  FiXCircle, FiChevronDown, FiChevronUp, FiArrowLeft,
  FiAlertCircle
} from "react-icons/fi";
import { SERVER_URL } from "../services/api";

const API_BASE = SERVER_URL;

const STATUS = {
  pending:    { label: "Order Received",  urdu: "آرڈر مل گیا",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  Icon: FiClock,        step: 1 },
  processing: { label: "Packing",         urdu: "پیکنگ ہو رہی ہے", color: "#c9a84c", bg: "rgba(201,168,76,0.1)", border: "rgba(201,168,76,0.2)",  Icon: FiPackage,      step: 2 },
  shipped:    { label: "On the Way",      urdu: "راستے میں ہے",    color: "#818cf8", bg: "rgba(129,140,248,0.1)",border: "rgba(129,140,248,0.2)", Icon: FiTruck,        step: 3 },
  delivered:  { label: "Delivered",       urdu: "پہنچ گیا",        color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.2)",  Icon: FiCheckCircle,  step: 4 },
  cancelled:  { label: "Cancelled",       urdu: "کینسل ہو گیا",    color: "#f87171", bg: "rgba(248,113,113,0.1)",border: "rgba(248,113,113,0.2)", Icon: FiXCircle,      step: 0 },
};

const STEPS = ["pending", "processing", "shipped", "delivered"];

export default function MyOrders() {
  const { user, token } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("MyOrders error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-deep)" }}>
        <div className="text-center space-y-4">
          <FiAlertCircle size={48} className="mx-auto" style={{ color: "var(--text-muted)" }} />
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Login Zaroori Hai</h2>
          <p style={{ color: "var(--text-muted)" }}>Orders dekhne ke liye login karo</p>
          <Link to="/login" className="btn-gold inline-flex">Login karo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6"
      style={{ background: "var(--bg-deep)" }}>
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/"
            className="p-2 rounded-xl transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <FiArrowLeft size={18} />
          </Link>
          <div>
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
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
                                      <span className="text-[9px] text-center leading-tight max-w-[52px]"
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
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
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

                          {/* DATES */}
                          <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                            <span>Ordered: {new Date(order.createdAt).toLocaleString("en-PK")}</span>
                            {order.deliveredAt && (
                              <span className="text-green-500">
                                Delivered: {new Date(order.deliveredAt).toLocaleString("en-PK")}
                              </span>
                            )}
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
