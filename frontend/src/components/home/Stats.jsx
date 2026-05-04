import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiUsers, FiPackage, FiTruck, FiAward, FiShield, FiRefreshCw, FiCreditCard, FiZap } from "react-icons/fi";
import api from "../../services/api";
import { useSettings } from "../../context/SettingsContext";

function CountUp({ target, prefix = "", suffix = "", duration = 1.5 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target || typeof target !== "number") return;
    const step = target / (duration * 60);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [target]);
  if (typeof target === "string") return <>{prefix}{target}{suffix}</>;
  return <>{prefix}{count.toLocaleString()}{suffix}</>;
}

export default function Stats() {
  const [data, setData]   = useState({ products: 0, delivery: 250 });
  const [loaded, setLoaded] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    api.get("/products")
      .then((r) => {
        const prods = (r.data.data || []).filter((p) => p.isActive !== false);
        setData({ products: prods.length, delivery: 250 });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const stats = [
    { Icon: FiUsers,   value: Math.max(data.products * 25, 500), suffix: "+", label: "Happy Customers",        color: "#c9a84c" },
    { Icon: FiPackage, value: data.products,                     suffix: "+", label: "Products In Store",      color: "#4ade80" },
    { Icon: FiTruck,   value: null, display: `Rs. ${data.delivery}`,          label: "Pakistan-Wide Delivery", color: "#60a5fa" },
    { Icon: FiAward,   value: Math.max(data.products * 8, 150),  suffix: "+", label: "Orders Completed",       color: "#c084fc" },
  ];

  const trust = [
    { Icon: FiShield,     label: "100% Original"  },
    { Icon: FiTruck,      label: "COD Available"   },
    { Icon: FiRefreshCw,  label: "Easy Returns"    },
    { Icon: FiCreditCard, label: "Secure Payments" },
    { Icon: FiZap,        label: "Fast Delivery"   },
  ];

  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6"
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="section-label mb-2">{settings?.statsSubLabel || "By The Numbers"}</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            {(settings?.statsTitle || "Pakistan Ke Bharose Ka").split(" ").slice(0,-1).join(" ")}{" "}
            <span className="gold-text">
              {(settings?.statsTitle || "Pakistan Ke Bharose Ka Nishaana").split(" ").slice(-1)[0]}
            </span>
          </h2>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mb-14">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}28`,
                  color: s.color,
                }}
              >
                <s.Icon size={22} />
              </motion.div>
              <div>
                <div className="font-display text-3xl sm:text-4xl font-bold" style={{ color: s.color }}>
                  {s.display ? s.display : loaded
                    ? <CountUp target={s.value} suffix={s.suffix} />
                    : <span className="opacity-20">—</span>
                  }
                </div>
                <div className="text-xs mt-1.5 uppercase tracking-widest leading-snug max-w-[120px] mx-auto"
                  style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TRUST STRIP */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {trust.map(({ Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-full transition-all"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Icon size={12} style={{ color: "var(--gold)" }} />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
