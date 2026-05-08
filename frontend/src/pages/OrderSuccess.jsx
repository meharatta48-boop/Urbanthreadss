import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCheck, FiShoppingBag, FiHome, FiPackage,
  FiTruck, FiClock, FiPhone, FiMail
} from "react-icons/fi";
import { useSettings } from "../context/SettingsContext";
import { metaTracker } from "../utils/metaTracking";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [dots, setDots] = useState(0);

  const orderId    = location.state?.orderId;
  const orderTotal = location.state?.total;
  const isGuest    = location.state?.isGuest;
  const guestName  = location.state?.name;

  useEffect(() => {
    if (!orderId) navigate("/shop", { replace: true });
  }, [orderId, navigate]);

  useEffect(() => {
    if (!orderId || !orderTotal) return;
    metaTracker.trackPurchase(orderId, Number(orderTotal), []);
  }, [orderId, orderTotal]);

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);

  if (!orderId) return null;

  const whatsapp  = settings?.whatsapp;
  const brandName = settings?.brandName || "URBAN THREAD";

  const steps = [
    { icon: FiClock,   label: "Order Received", desc: "Aapka order mil gaya" },
    { icon: FiPackage, label: "Packing",         desc: "Tayyari ho rahi hai" },
    { icon: FiTruck,   label: "On the Way",      desc: "Delivery par hai" },
    { icon: FiCheck,   label: "Delivered",       desc: "Aapke ghar aa gaya" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20"
      style={{ background: "var(--bg-deep)" }}>

      {/* AMBIENT GLOW */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >

        {/* SUCCESS ICON */}
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(201,168,76,0.1)", transform: "scale(1.4)", border: "1px solid rgba(201,168,76,0.2)" }}
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
              style={{ background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 50%, #8a6a1a 100%)", boxShadow: "0 0 60px rgba(201,168,76,0.4)" }}
            >
              <FiCheck size={44} className="text-black" strokeWidth={3} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
            <p className="section-label mb-2">Order Confirmed</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Mubarak Ho! 🎉
            </h1>
            {guestName && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Shukriya, <span className="font-medium" style={{ color: "var(--text-primary)" }}>{guestName}</span>!
              </p>
            )}
          </motion.div>
        </div>

        {/* ORDER ID CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="rounded-2xl p-5 sm:p-6 mb-4"
          style={{ background: "var(--bg-surface)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Order ID</p>
              <p className="font-mono font-bold text-base sm:text-lg" style={{ color: "var(--gold)" }}>
                #{orderId.slice(-10).toUpperCase()}
              </p>
            </div>
            {orderTotal && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Total Payable</p>
                <p className="font-display text-xl sm:text-2xl font-bold gold-text">
                  Rs. {Number(orderTotal).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* DELIVERY STEPS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="rounded-2xl p-5 sm:p-6 mb-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="font-semibold text-sm mb-5" style={{ color: "var(--text-primary)" }}>Delivery Process</h2>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-5 right-5 h-px" style={{ background: "var(--border)" }} />
            <div className="absolute top-4 left-5 h-px gold-gradient" style={{ width: "0%" }} />

            {steps.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{
                    background: i === 0 ? "rgba(201,168,76,0.15)" : "var(--bg-surface)",
                    borderColor: i === 0 ? "#c9a84c" : "var(--border)",
                  }}
                >
                  <s.icon size={13} style={{ color: i === 0 ? "#c9a84c" : "var(--text-muted)" }} />
                </div>
                <div className="text-center px-1">
                  <p className="text-[9px] sm:text-[10px] font-semibold leading-tight"
                    style={{ color: i === 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {s.label}
                  </p>
                  <p className="text-[8px] hidden sm:block" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl p-3 text-center"
            style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>
              📦 2–5 business days mein delivery hogi
            </p>
          </div>
        </motion.div>

        {/* INFO NOTE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="rounded-2xl p-5 sm:p-6 mb-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FiPhone size={13} style={{ color: "var(--gold)" }} />
            Kya expect karein?
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
            {[
              "Hamare team ka call aayega order confirm karne ke liye",
              "Delivery 2–5 business days mein hogi",
              "COD — delivery pe payment karein, bilkul safe",
              ...(whatsapp ? ["Koi sawaal? WhatsApp pe hum se baat karein"] : []),
            ].map((txt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: "var(--gold)", marginTop: "2px", flexShrink: 0 }}>✓</span>
                {txt}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* GUEST: CREATE ACCOUNT */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="rounded-2xl p-5 sm:p-6 mb-4"
            style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <p className="font-semibold mb-1 flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
              <FiShoppingBag style={{ color: "var(--gold)" }} size={14} />
              Account Banao — Bilkul Free!
            </p>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Account se apne sare orders track kar sako, reviews de sako aur agla order aur bhi jaldi ho.
            </p>
            <Link to="/signup" className="btn-gold w-full text-center"
              style={{ width: "100%", fontSize: "0.85rem", padding: "12px 20px" }}>
              Sign Up — Free
            </Link>
          </motion.div>
        )}

        {/* ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isGuest ? 1.0 : 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"
        >
          {!isGuest && (
            <Link to="/my-orders" className="btn-gold w-full text-center"
              style={{ fontSize: "0.88rem", padding: "13px 20px" }}>
              <FiShoppingBag size={14} /> My Orders Dekhein
            </Link>
          )}

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                `Salaam! Mera order ${orderId.slice(-8).toUpperCase()} ka status poochna tha.`
              )}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border transition-all text-sm font-semibold py-3 px-5"
              style={{ borderColor: "rgba(37,211,102,0.3)", color: "#25d366", background: "rgba(37,211,102,0.05)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.05)"}
            >
              <FiPhone size={14} /> WhatsApp Support
            </a>
          )}

          <Link to="/shop" className="btn-outline w-full text-center"
            style={{ fontSize: "0.88rem", padding: "13px 20px" }}>
            <FiShoppingBag size={14} /> Shopping Jari Rakhein
          </Link>

          <Link to="/"
            className="flex items-center justify-center gap-2 text-sm transition-colors py-3"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <FiHome size={14} /> Home
          </Link>
        </motion.div>

        {/* BRAND FOOTER */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}
        >
          © {new Date().getFullYear()} {brandName} · Shukriya hamse kharidne ka! 🇵🇰
        </motion.p>
      </motion.div>
    </div>
  );
}
