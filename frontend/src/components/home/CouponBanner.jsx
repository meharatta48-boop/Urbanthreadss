import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FiTag, FiCopy, FiX, FiClock } from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";
import { toast } from "react-toastify";

const HIDE_DURATION = 15;

export default function CouponBanner() {
  const { settings } = useSettings();
  const [visible, setVisible]   = useState(true);
  const [copied, setCopied]     = useState(false);
  const [timeLeft, setTimeLeft] = useState(HIDE_DURATION);
  const timerRef = useRef(null);

  const isAnnouncement = !!settings?.announcementText;
  const hasCoupon      = !!settings?.couponCode;

  useEffect(() => {
    if (!hasCoupon && !isAnnouncement) return;
    setVisible(true);
    if (isAnnouncement) return; // announcement stays until X
    setTimeLeft(HIDE_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setVisible(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [settings?.couponCode, settings?.announcementText]);

  if (!visible || (!isAnnouncement && !hasCoupon)) return null;

  const handleCopy = () => {
    if (!settings?.couponCode) return;
    navigator.clipboard.writeText(settings.couponCode);
    setCopied(true);
    toast.success(`Code "${settings.couponCode}" copy ho gaya!`);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = () => { clearInterval(timerRef.current); setVisible(false); };

  const progress = (timeLeft / HIDE_DURATION) * 100;
  const bg    = isAnnouncement ? (settings.announcementBg    || "#c9a84c") : "#c9a84c";
  const color = isAnnouncement ? (settings.announcementColor || "#000000") : "#000000";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full relative overflow-hidden z-[60]"
          style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px' }}
        >
          <div className="relative overflow-hidden w-full" style={{ background: bg }}>
            {/* Progress bar (coupon only) */}
            {!isAnnouncement && (
              <motion.div className="absolute bottom-0 left-0 h-[2px]"
                style={{ background: "rgba(0,0,0,0.2)", width: `${progress}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            )}

            <div className="py-2 px-4 flex items-center justify-center gap-2 sm:gap-3 text-sm font-semibold relative" style={{ color, paddingTop: '4px', paddingBottom: '4px' }}>
              {!isAnnouncement && <FiTag size={13} className="flex-shrink-0 hidden sm:block" />}

              <span className="text-center text-xs sm:text-sm">
                {isAnnouncement
                  ? settings.announcementText
                  : <>🎉 Code <strong className="font-black tracking-wider">{settings.couponCode}</strong> — Rs. <strong>{settings.couponDiscount?.toLocaleString()}</strong> ki bachat!</>
                }
              </span>

              {!isAnnouncement && (
                <>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 bg-black/20 hover:bg-black/30 font-bold px-2.5 py-1 rounded-lg text-xs transition-all border border-black/10 flex-shrink-0"
                    style={{ color }}>
                    <FiCopy size={11} />
                    <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                  </button>
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold bg-black/15 px-2 py-0.5 rounded-full flex-shrink-0" style={{ color }}>
                    <FiClock size={9} />{timeLeft}s
                  </span>
                </>
              )}

              <button onClick={handleClose}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                style={{ color }}>
                <FiX size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
