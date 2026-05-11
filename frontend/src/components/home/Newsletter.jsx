import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import { useSettings } from "../../context/SettingsContext";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { settings } = useSettings();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Please enter a valid email address");
    toast.success("Subscribed! You'll now receive exclusive drops and deals 🎉");
    setEmail("");
  };

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 bg-(--bg-surface) transition-colors duration-500 overflow-hidden relative">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-(--gold)/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-(--bg-card) border border-(--border) rounded-[3rem] p-10 sm:p-20 text-center shadow-3xl shadow-black/[0.03] dark:shadow-black/20"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-(--gold)/20 bg-(--gold)/5 text-(--gold) text-[10px] uppercase tracking-[0.2em] font-bold">
              Join the Community
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                {(settings?.newsletterTitle || "Get Exclusive Deals First").replace(/ (\w+)$/, "")}{" "}
                <span className="gold-text italic">
                  {(settings?.newsletterTitle || "Get Exclusive Deals First").match(/\w+$/)?.[0]}
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-(--text-muted) max-w-2xl mx-auto font-light">
                {settings?.newsletterDesc || "Subscribe karo aur pehle pao — new drops, flash sales, aur sirf subscriber offers."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-4">
              <div className="relative flex-1 group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--gold) transition-colors">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="lux-input w-full pl-12 py-5 rounded-2xl bg-(--bg-deep)/50"
                  required
                />
              </div>
              <button type="submit" className="btn-gold group px-8 py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-(--gold)/20 transition-all hover:scale-105 active:scale-95">
                Subscribe <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="flex flex-col items-center gap-2 pt-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-(--text-muted)">
                Trusted by 5,000+ fashion enthusiasts across Pakistan
              </p>
              <div className="w-12 h-1 bg-(--gold)/20 rounded-full" />
              <p className="text-[9px] text-(--text-muted)/60">
                By subscribing, you agree to our Privacy Policy. No spam, ever.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
