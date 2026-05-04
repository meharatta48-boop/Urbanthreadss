// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSettings } from "../context/SettingsContext";

// Default WhatsApp number
const DEFAULT_WHATSAPP = "923003765389";

export default function WhatsAppFloat() {
  const { settings } = useSettings();
  const [hovered, setHovered] = useState(false);

  const number = settings?.whatsapp || DEFAULT_WHATSAPP;
  const message = encodeURIComponent(
    `Assalam-o-Alaikum! ${settings?.brandName || "Urban Thread"} se inquiry karna chahta/chahti hoon. 🙏`
  );
  const href = `https://wa.me/${number}?text=${message}`;

  if (settings?.whatsappFloatEnabled === false) return null;

  return (
    <div
      className="fixed bottom-6 right-5 z-50 flex items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* TOOLTIP */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0c0c0c] border border-[#1a1a1a] text-white text-xs px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none"
          >
            <p className="font-semibold">WhatsApp pe Baat Karo</p>
            <p className="text-[#555] text-[10px] mt-0.5">+{number}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BUTTON */}
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        style={{ background: "#25D366" }}
        aria-label="Chat on WhatsApp"
      >
        {/* PULSE RING */}
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "rgba(37, 211, 102, 0.35)" }}
        />
        {/* WHATSAPP SVG ICON */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="white"
          className="w-7 h-7 relative z-10"
        >
          <path d="M16 2C8.27 2 2 8.27 2 16c0 2.47.67 4.78 1.83 6.77L2 30l7.44-1.79A13.94 13.94 0 0 0 16 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm7.21 19.07c-.31.87-1.8 1.66-2.47 1.75-.65.09-1.48.13-2.38-.15-.55-.17-1.26-.4-2.17-.77-3.82-1.65-6.32-5.49-6.51-5.74-.19-.25-1.57-2.09-1.57-3.99s.99-2.84 1.35-3.22c.36-.38.78-.47 1.04-.47s.52.01.74.02c.23.01.55-.09.86.66.31.75 1.06 2.59 1.15 2.78.09.19.15.41.03.65-.12.24-.18.39-.36.6-.18.21-.38.47-.54.63-.18.18-.37.37-.16.72.21.35.94 1.55 2.01 2.51 1.38 1.23 2.55 1.61 2.9 1.79.35.18.56.15.77-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.1.99 2.46 1.17.36.18.6.27.69.42.09.15.09.88-.22 1.75z" />
        </svg>
      </motion.a>
    </div>
  );
}
