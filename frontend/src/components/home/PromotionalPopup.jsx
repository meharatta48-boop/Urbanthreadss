import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { SERVER_URL } from "../../services/api";

export default function PromotionalPopup() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup is enabled
    if (settings?.popupEnabled) {
      // Check if user has already seen it in this session or ever
      const hasSeen = sessionStorage.getItem("ut_popup_seen");
      if (!hasSeen) {
        // Delay popup slightly for better UX
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [settings]);

  const close = () => {
    setIsOpen(false);
    sessionStorage.setItem("ut_popup_seen", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-[#0c0c0c] border border-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-all"
            >
              <FiX size={16} />
            </button>

            {settings?.popupImage && (
              <div className="w-full h-48 sm:h-64 relative">
                <img
                  src={`${SERVER_URL}${settings.popupImage}`}
                  alt="Promo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0c0c0c] to-transparent"></div>
              </div>
            )}

            <div className={`p-6 sm:p-8 text-center ${!settings?.popupImage ? 'pt-10' : ''}`}>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
                {settings?.popupTitle || "Special Offer!"}
              </h2>
              <p className="text-[#999] text-sm sm:text-base leading-relaxed mb-6">
                {settings?.popupText || "Get amazing discounts on our latest collection."}
              </p>
              
              {settings?.popupCtaLink && settings?.popupCtaText && (
                <Link
                  to={settings.popupCtaLink}
                  onClick={close}
                  className="inline-block px-8 py-3 rounded-xl font-bold text-black transition-transform active:scale-95"
                  style={{ background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }}
                >
                  {settings.popupCtaText}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
