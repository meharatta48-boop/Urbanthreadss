import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import fallbackImg from "../../assets/images/slider1.jpg";

import { SERVER_URL } from "../../services/api";
const API_BASE = SERVER_URL;

export default function BrandStory() {
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";

  const img = settings?.brandImage
    ? `${API_BASE}${settings.brandImage}`
    : fallbackImg;

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6"
      style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "var(--brand-ratio, 4/5)" }}>
            <img src={img} alt="Brand Story" className="w-full h-full object-cover" />
          </div>

          {/* YEAR BADGE */}
          <div className="absolute bottom-4 right-4 backdrop-blur-sm p-4 rounded-xl shadow-2xl"
            style={{ background: "var(--bg-surface)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <div className="font-display text-2xl font-bold gold-text">{settings?.brandYear || "2020"}</div>
            <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "var(--text-muted)" }}>Founded In Pakistan</div>
          </div>

          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#c9a84c]/30 rounded-tl-xl hidden sm:block" />
        </motion.div>

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="space-y-6"
        >
          <p className="section-label">Our Story</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}>
            {settings?.brandTitle || "Fashion Born From"}{" "}
            <span className="gold-text">Pakistani Streets</span>
          </h2>
          <p className="leading-relaxed text-base sm:text-lg" style={{ color: "var(--text-secondary)" }}>
            {settings?.brandText1 || `${brandName} was born from a simple vision — to bring world-class streetwear to the streets of Pakistan.`}
          </p>
          <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {settings?.brandText2 || "From Karachi ki garmi to Lahore ki shaam, our fabrics are designed to move with you."}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { label: "Premium Fabric", desc: "Locally sourced, globally inspired" },
              { label: "Unique Designs", desc: "New drops every season" },
              { label: "Affordable Price", desc: "Rs. 499 se shuru" },
              { label: "Fast Delivery", desc: "Poore Pakistan mein" },
            ].map((v) => (
              <div key={v.label} className="flex gap-3">
                <div className="w-1 min-h-[36px] gold-gradient rounded-full flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{v.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Link to="/shop" className="btn-gold inline-flex">
            Explore Collection <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
