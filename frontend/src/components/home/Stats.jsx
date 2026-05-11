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
  }, [target, duration]);
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
    { Icon: FiUsers,   value: Math.max(data.products * 25, 500), suffix: "+", label: "Happy Customers",        color: "var(--gold)" },
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
      className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
      style={{
        background: "var(--bg-surface)",
      }}
    >
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-(--gold)/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-(--gold)/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-(--gold)/20 bg-(--gold)/5 text-(--gold) text-[10px] uppercase tracking-[0.2em] font-bold mb-4 backdrop-blur-sm">
            {settings?.statsSubLabel || "Our Impact"}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
            {(settings?.statsTitle || "Pakistan Ke Bharose Ka").split(" ").slice(0,-1).join(" ")}{" "}
            <span className="gold-text">
              {(settings?.statsTitle || "Pakistan Ke Bharose Ka Nishaana").split(" ").slice(-1)[0]}
            </span>
          </h2>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group p-8 rounded-4xl bg-(--bg-card) border border-(--border) hover:border-(--gold)/30 transition-all duration-500 shadow-xl shadow-black/[0.03] dark:shadow-black/20"
            >
              <div className="flex flex-col items-center text-center gap-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    background: `linear-gradient(135deg, ${s.color}20 0%, ${s.color}05 100%)`,
                    border: `1px solid ${s.color}30`,
                    color: s.color,
                  }}
                >
                  <s.Icon size={24} />
                </div>
                <div>
                  <div className="font-display text-3xl sm:text-4xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    {s.display ? s.display : loaded
                      ? <CountUp target={s.value} suffix={s.suffix} />
                      : <span className="opacity-20">—</span>
                    }
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold"
                    style={{ color: "var(--text-muted)" }}>
                    {s.label}
                  </div>
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
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {trust.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-2xl transition-all bg-(--bg-surface) border border-(--border) hover:border-(--gold)/30 text-(--text-muted) hover:text-(--text-primary)"
            >
              <t.Icon size={14} className="text-(--gold)" />
              {t.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
