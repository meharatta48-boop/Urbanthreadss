import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiWifi, FiX, FiRefreshCw } from "react-icons/fi";
import api from "../../services/api";

/**
 * ServerWakeUp — shows a banner when the Render.com backend is cold-starting.
 * Polls the /health endpoint and dismisses itself once the server responds.
 * Appears after 4 seconds if no successful API response yet.
 */
export default function ServerWakeUp() {
  const [status, setStatus] = useState("checking"); // "checking" | "awake" | "sleeping"
  const [visible, setVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Show banner only after 4s of waiting
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status !== "awake") setVisible(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [status]);

  // Elapsed seconds counter
  useEffect(() => {
    if (!visible || status === "awake") return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [visible, status]);

  // Poll health endpoint
  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const checkHealth = async () => {
      try {
        await api.get("/health", { timeout: 8000 });
        if (!cancelled) {
          setStatus("awake");
          setVisible(false);
        }
      } catch {
        if (!cancelled) {
          setStatus("sleeping");
          // Retry every 8 seconds
          if (attempts < 10) {
            attempts++;
            setTimeout(checkHealth, 8000);
          }
        }
      }
    };

    checkHealth();
    return () => { cancelled = true; };
  }, []);

  if (dismissed || status === "awake") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-3 mb-0 rounded-2xl border overflow-hidden"
          style={{
            background: "rgba(201,168,76,0.06)",
            borderColor: "rgba(201,168,76,0.2)",
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Animated icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(201,168,76,0.12)" }}
            >
              <FiRefreshCw
                size={14}
                className="text-(--gold) animate-spin"
                style={{ animationDuration: "2s" }}
              />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-(--gold) font-semibold text-xs">
                ⚡ Server Warm Ho Raha Hai ({elapsed}s)
              </p>
              <p className="text-(--text-muted) text-[10px] mt-0.5">
                Render.com free server cold-start ho raha hai. 30-50 seconds lagenge — phir sab kaam karega.
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1 shrink-0">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-(--gold)"
                  style={{
                    animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-all shrink-0"
              title="Dismiss"
            >
              <FiX size={12} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-(--border)">
            <motion.div
              className="h-full bg-(--gold)"
              animate={{ width: ["0%", "90%"] }}
              transition={{ duration: 45, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
