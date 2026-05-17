import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import fallbackImg from "../../assets/images/slider1.jpg";

import { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";
const API_BASE = SERVER_URL;

export default function BrandStory() {
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";

  const img = settings?.brandImage
    ? getImageUrl(settings.brandImage)
    : fallbackImg;

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 bg-(--bg-deep) transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* IMAGE SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-2 lg:order-1"
          >
            {/* Main Image Container */}
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border border-(--border) aspect-4/5">
              <img src={img} alt="Brand Story" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-40" />
            </div>

            {/* Decorative Year Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 z-20 backdrop-blur-xl p-4 sm:p-8 rounded-3xl sm:rounded-4xl shadow-2xl border border-(--gold)/20 bg-(--bg-surface)/80"
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-(--text-muted) mb-1">Since</span>
                <div className="font-display text-3xl sm:text-5xl font-bold gold-text leading-none">{settings?.brandYear || "2020"}</div>
                <div className="w-6 h-0.5 sm:w-8 sm:h-1 bg-(--gold) rounded-full mt-2 sm:mt-3 mb-1 sm:mb-2" />
                <span className="text-[7px] sm:text-[9px] uppercase tracking-widest text-(--text-secondary) font-bold">Pakistani Roots</span>
              </div>
            </motion.div>

            {/* Background Accents */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-(--gold)/10 blur-[80px] rounded-full" />
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-(--gold)/30 rounded-tl-[3rem] -translate-x-4 -translate-y-4" />
          </motion.div>

          {/* TEXT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-(--gold)/20 bg-(--gold)/5 text-(--gold) text-[10px] uppercase tracking-[0.2em] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-(--gold) animate-pulse" />
                Our Story
              </div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-(--text-primary)">
                {settings?.brandTitle || "Fashion Born From"}{" "}
                <span className="gold-text italic">Pakistani Streets</span>
              </h2>
              <div className="w-20 h-1.5 bg-(--gold) rounded-full" />
            </div>

            <div className="space-y-6">
              <p className="text-lg sm:text-xl leading-relaxed text-(--text-secondary) font-light italic">
                {settings?.brandText1 || `${brandName} was born from a simple vision — to bring world-class streetwear to the streets of Pakistan.`}
              </p>
              <p className="text-base leading-relaxed text-(--text-muted)">
                {settings?.brandText2 || "From Karachi ki garmi to Lahore ki shaam, our fabrics are designed to move with you, blending authentic street culture with premium craftsmanship."}
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {[
                { label: "Premium Fabric", desc: "Locally sourced quality" },
                { label: "Unique Designs", desc: "Seasonal limited drops" },
                { label: "Fair Pricing", desc: "Luxury within reach" },
                { label: "Fast Delivery", desc: "Nationwide coverage" },
              ].map((v) => (
                <div key={v.label} className="group flex items-start gap-4 p-4 rounded-2xl transition-all hover:bg-(--bg-surface) border border-transparent hover:border-(--border)">
                  <div className="mt-1 w-6 h-6 rounded-full bg-(--gold)/10 flex items-center justify-center text-(--gold) transition-colors group-hover:bg-(--gold) group-hover:text-black">
                    <FiCheckCircle size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-(--text-primary)">{v.label}</div>
                    <div className="text-xs text-(--text-muted) mt-0.5">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link to="/shop" className="btn-gold group px-10 py-4 rounded-full flex items-center gap-3 w-max shadow-xl shadow-(--gold)/20">
                Explore The Collection 
                <FiArrowRight className="transition-transform group-hover:translate-x-1.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
