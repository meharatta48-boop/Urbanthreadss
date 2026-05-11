import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function LaunchTimer({ launchDate }) {
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(launchDate).getTime() - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  }, [launchDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-(--bg-deep) text-(--text-primary) overflow-hidden p-4 transition-colors duration-500">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 dark:opacity-20 transition-opacity duration-1000">
        <div className="w-[60vw] h-[60vw] rounded-full bg-(--gold) blur-[150px]"></div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <span className="gold-gradient text-black text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 shadow-lg shadow-(--gold)/20">
          Coming Soon
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-(--text-primary) mb-10 tracking-wider">
          We Are Launching In
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-(--bg-surface) border border-(--border) flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-(--bg-elevated) to-transparent opacity-50" />
                <span className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-(--gold) drop-shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                  {value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-(--text-muted) text-xs sm:text-sm uppercase tracking-widest mt-4 font-medium">
                {unit}
              </span>
            </div>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-(--text-secondary) text-sm sm:text-base mt-12 max-w-md"
        >
          {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 
            ? "We're almost ready! Refresh the page or wait for the admin to make it live." 
            : "Get ready for the ultimate experience. We're working hard to bring you something amazing."}
        </motion.p>
      </motion.div>
    </div>
  );
}
