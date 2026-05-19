import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

/* ── Particle background ── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10 animate-pulse"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            background: "#c9a84c",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 4 + 2}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Flip digit tile ── */
function DigitTile({ value, label }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 perspective-[600px]">
        {/* Card face */}
        <motion.div
          key={display}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl flex items-center justify-center shadow-2xl border border-white/5"
          style={{
            background: "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)",
          }}
        >
          {/* Shine overlay */}
          <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
          {/* Divider line */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/30 pointer-events-none" />
          <span
            className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-mono font-black tracking-tighter"
            style={{
              color: "var(--gold)",
              textShadow: "0 0 30px rgba(201,168,76,0.4)",
            }}
          >
            {display}
          </span>
        </motion.div>
      </div>
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold"
        style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

export default function LaunchTimer({ launchDate }) {
  const calcLeft = useCallback(() => {
    const diff = new Date(launchDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      done: false,
    };
  }, [launchDate]);

  const [timeLeft, setTimeLeft] = useState(calcLeft());
  const [launched, setLaunched] = useState(false);
  const autoDisableRef = useRef(false);

  /* ── Auto-disable isComingSoon when timer hits 0 ── */
  const disableComingSoon = useCallback(async () => {
    if (autoDisableRef.current) return;
    autoDisableRef.current = true;
    try {
      // Call public settings endpoint which auto-disables isComingSoon on backend if launchDate passed
      const res = await api.get("/settings");
      if (res?.data?.success) {
        setLaunched(true);
        // After 3.5s celebration, reload so the real site shows up
        setTimeout(() => window.location.reload(), 3500);
      } else {
        // Even if API fails, reload after delay so user can see the site
        setTimeout(() => window.location.reload(), 4000);
      }
    } catch {
      setTimeout(() => window.location.reload(), 4000);
    }
  }, []);

  useEffect(() => {
    // If already past launch date on mount
    if (calcLeft().done) {
      disableComingSoon();
      return;
    }

    const id = setInterval(() => {
      const left = calcLeft();
      setTimeLeft(left);
      if (left.done) {
        clearInterval(id);
        disableComingSoon();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [calcLeft, disableComingSoon]);

  const tiles = [
    { value: timeLeft.days,    label: "Days"    },
    { value: timeLeft.hours,   label: "Hours"   },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  /* ── Launch celebration screen ── */
  if (launched) {
    return (
      <div
        className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "var(--bg-deep)" }}
      >
        <Particles />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="relative z-10 flex flex-col items-center text-center gap-6 px-6"
        >
          {/* Glow ring */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #f0d060)",
              boxShadow: "0 0 80px rgba(201,168,76,0.5)",
            }}
          >
            <span className="text-5xl">🚀</span>
          </div>
          <div>
            <h1 className="font-display text-4xl sm:text-6xl font-black text-white mb-3">
              We&apos;re Live!
            </h1>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>
              Website ab khulja rahi hai... ✨
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border"
            style={{ borderColor: "rgba(201,168,76,0.3)", color: "var(--gold)" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Redirecting automatically...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden p-4 transition-colors duration-500"
      style={{ background: "var(--bg-deep)", color: "var(--text-primary)" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[70vw] h-[70vw] rounded-full blur-[160px] opacity-[0.06]"
          style={{ background: "var(--gold)" }}
        />
      </div>

      <Particles />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center gap-8 max-w-3xl w-full"
      >
        {/* Badge */}
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-black text-xs sm:text-sm font-bold px-5 py-2 rounded-full uppercase tracking-widest shadow-lg"
          style={{
            background: "linear-gradient(90deg, #c9a84c, #f0d060)",
            boxShadow: "0 4px 20px rgba(201,168,76,0.25)",
          }}
        >
          🚀 Coming Soon
        </motion.span>

        {/* Headline */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          We&apos;re Launching In
        </motion.h1>

        {/* COUNTDOWN TILES */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10"
        >
          {tiles.map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-4 sm:gap-6 md:gap-10">
              <DigitTile value={value} label={label} />
              {i < 3 && (
                <span
                  className="text-3xl sm:text-4xl font-black font-mono -mt-8 opacity-40"
                  style={{ color: "var(--gold)" }}
                >
                  :
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-base sm:text-lg max-w-md leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0
            ? "🎉 Launch ho raha hai! Ek second..."
            : "Kuch khaas tiyari ho rahi hai. Hum aapke liye ek amazing experience bana rahe hain."}
        </motion.p>

        {/* Launch date info */}
        {launchDate && !timeLeft.done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-full border"
            style={{
              borderColor: "rgba(201,168,76,0.2)",
              color: "var(--text-muted)",
              background: "rgba(201,168,76,0.05)",
            }}
          >
            📅 Launch:{" "}
            <span style={{ color: "var(--gold)" }} className="font-semibold">
              {new Date(launchDate).toLocaleString("en-PK", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
