import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";
import { useSettings } from "../../context/SettingsContext";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { settings } = useSettings();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Valid email daalo");
    toast.success("Subscribed! Exclusive deals ab aapko milenge 🎉");
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6"
      style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-5 sm:space-y-6"
        >
          <span className="section-label">{settings?.newsletterLabel || "Newsletter"}</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{ color: "var(--text-primary)" }}>
            {(settings?.newsletterTitle || "Get Exclusive Deals First").replace(/ (\w+)$/, "")}{" "}
            <span className="gold-text">
              {(settings?.newsletterTitle || "Get Exclusive Deals First").match(/\w+$/)?.[0]}
            </span>
          </h2>
          <p className="text-base sm:text-lg" style={{ color: "var(--text-secondary)" }}>
            {settings?.newsletterDesc || "Subscribe karo aur pehle pao — new drops, flash sales, aur sirf subscriber offers."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aapka@email.com"
              className="lux-input flex-1"
            />
            <button type="submit" className="btn-gold whitespace-nowrap">
              Subscribe <FiArrowRight />
            </button>
          </form>

          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No spam. Kabhi nahi. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
