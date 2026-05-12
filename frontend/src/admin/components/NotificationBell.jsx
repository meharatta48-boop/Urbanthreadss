import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import {
  FiBell, FiShoppingBag, FiAlertTriangle, FiCheck,
  FiPackage, FiX, FiClock
} from "react-icons/fi";

const STATUS_COLOR = {
  pending: "#f59e0b",
  processing: "#c9a84c",
  shipped: "#818cf8",
  delivered: "#4ade80",
  cancelled: "#f87171",
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "abhi abhi";
  if (s < 3600) return `${Math.floor(s / 60)} min pehle`;
  if (s < 86400) return `${Math.floor(s / 3600)} ghante pehle`;
  return `${Math.floor(s / 86400)} din pehle`;
};

export default function NotificationBell() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("readNotifIds") || "[]"); } catch { return []; }
  });
  const ref = useRef(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/orders", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/products"),
      ]);

      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.data || [];
      const notifs = [];

      // NEW ORDERS (pending) — last 24 hours
      orders
        .filter((o) => o.orderStatus === "pending")
        .forEach((o) => {
          notifs.push({
            id: `order-${o._id}`,
            type: "order",
            icon: FiShoppingBag,
            color: STATUS_COLOR.pending,
            bg: "rgba(245,158,11,0.1)",
            title: "New Order!",
            body: `${o.user?.name || "Customer"} ne Rs. ${o.totalPrice?.toLocaleString()} ka order diya`,
            time: o.createdAt,
            action: () => navigate("/admin-dashboard/orders"),
          });
        });

      // LOW STOCK ALERTS
      products
        .filter((p) => p.stock > 0 && p.stock <= 5)
        .forEach((p) => {
          notifs.push({
            id: `lowstock-${p._id}`,
            type: "stock",
            icon: FiAlertTriangle,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.08)",
            title: "Low Stock!",
            body: `"${p.name}" sirf ${p.stock} bacha — stock update karo`,
            time: p.updatedAt,
            action: () => navigate(`/admin-dashboard/products/${p._id}/edit`),
          });
        });

      // OUT OF STOCK
      products
        .filter((p) => p.stock === 0)
        .forEach((p) => {
          notifs.push({
            id: `outstock-${p._id}`,
            type: "stock",
            icon: FiX,
            color: "#f87171",
            bg: "rgba(248,113,113,0.08)",
            title: "Out of Stock!",
            body: `"${p.name}" bilkul khatam ho gaya`,
            time: p.updatedAt,
            action: () => navigate(`/admin-dashboard/products/${p._id}/edit`),
          });
        });

      // Sort by time, newest first
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs.slice(0, 15));
    } catch (err) {
      console.error("Notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30 sec
    return () => clearInterval(interval);
  }, [token]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem("readNotifIds", JSON.stringify(allIds));
  };

  const handleClick = (notif) => {
    const updated = [...new Set([...readIds, notif.id])];
    setReadIds(updated);
    localStorage.setItem("readNotifIds", JSON.stringify(updated));
    setOpen(false);
    notif.action?.();
  };

  return (
    <div className="relative" ref={ref}>
      {/* BELL BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-xl border transition-all ${
          open
            ? "border-(--gold)/30 text-(--gold) bg-(--gold)/8"
            : "border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/20"
        }`}
      >
        <FiBell size={16} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-[9px] font-bold text-black gold-gradient rounded-full flex items-center justify-center px-0.5"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
        {/* PULSE when new */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] gold-gradient rounded-full animate-ping opacity-30" />
        )}
      </button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-(--bg-card) border border-(--border) rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ maxHeight: "80vh" }}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-(--border)">
              <div className="flex items-center gap-2">
                <FiBell size={15} className="text-[#c9a84c]" />
                <span className="text-(--text-primary) font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] gold-gradient text-black px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} naye
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-(--text-muted) hover:text-(--gold) transition-colors flex items-center gap-1"
                >
                  <FiCheck size={10} /> Sab read karo
                </button>
              )}
            </div>

            {/* NOTIFICATIONS LIST */}
            <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-(--text-muted)">
                  <FiBell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Koi notification nahi</p>
                </div>
              ) : (
                <div className="divide-y divide-(--border)">
                  {notifications.map((n) => {
                    const isRead = readIds.includes(n.id);
                    return (
                      <motion.button
                        key={n.id}
                        onClick={() => handleClick(n)}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-(--bg-elevated) ${
                          isRead ? "opacity-50" : ""
                        }`}
                      >
                        {/* ICON */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: n.bg, border: `1px solid ${n.color}30` }}
                        >
                          <n.icon size={15} style={{ color: n.color }} />
                        </div>

                        {/* TEXT */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-(--text-primary) text-xs font-semibold">{n.title}</p>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: n.color }} />
                            )}
                          </div>
                          <p className="text-(--text-muted) text-[11px] mt-0.5 leading-snug">{n.body}</p>
                          <p className="text-(--text-muted)/60 text-[10px] mt-1 flex items-center gap-1">
                            <FiClock size={9} /> {timeAgo(n.time)}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-(--border) px-4 py-3">
              <button
                onClick={() => { setOpen(false); navigate("/admin-dashboard/orders"); }}
                className="w-full text-center text-xs text-(--text-muted) hover:text-(--gold) transition-colors"
              >
                Sare Orders dekho →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
