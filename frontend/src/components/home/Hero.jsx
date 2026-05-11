import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  FiArrowRight, FiShoppingBag, FiPlay
} from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";
import fallbackImg from "../../assets/images/slider1.jpg";

import { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";
const API_BASE = SERVER_URL;

const shouldReduceMotion = () => {
  if (typeof window === "undefined") return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return reduce || coarse;
};

export default function Hero() {
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1); // 1=forward, -1=back
  const [reduceMotion, setReduceMotion] = useState(() => shouldReduceMotion());

  // Build slides from heroSlides (new) OR legacy heroImages
  const buildSlides = () => {
    const hs = settings?.heroSlides;
    if (hs?.length) {
      return hs.map((s) => ({
        image: s.image ? getImageUrl(s.image) : fallbackImg,
        label: s.label || brandName,
        title: s.title || "Style That\nSpeaks Louder",
        sub: s.subtitle || "Pakistan ka premium streetwear brand.",
        cta: s.cta || "Shop Collection",
      }));
    }
    const imgs = settings?.heroImages?.length
      ? settings.heroImages.map((p) => getImageUrl(p))
      : [fallbackImg];
    return imgs.map((image, i) => ({
      image,
      label: i === 0 ? (settings?.heroLabel || "New Season 2026") : `Slide ${i + 1}`,
      title: i === 0 ? (settings?.heroTitle || "Style That\nSpeaks Louder") : `${brandName.split(" ")[0] || brandName}\n${brandName.split(" ").slice(1).join(" ") || "Thread"}`,
      sub: i === 0 ? (settings?.heroSubtitle || "Pakistan ka premium streetwear.") : "Fashion ka naya andaz.",
      cta: i === 0 ? (settings?.heroCta || "Shop Collection") : "Browse All",
    }));
  };

  const slides = buildSlides();

  const goTo = useCallback((newIdx, direction = 1) => {
    setDir(direction);
    setIdx(newIdx);
  }, []);

  const next = useCallback(() => goTo((idx + 1) % slides.length, 1), [idx, slides.length]);
  const prev = useCallback(() => goTo((idx - 1 + slides.length) % slides.length, -1), [idx, slides.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(shouldReduceMotion());
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 10000);
    return () => clearInterval(t);
  }, [slides.length, next]);

  useEffect(() => { if (idx >= slides.length) setIdx(0); }, [slides.length]);
  useEffect(() => {
    if (!slides.length) return;
    const currentImg = new Image();
    currentImg.src = slides[idx]?.image;
    const nextImg = new Image();
    nextImg.src = slides[(idx + 1) % slides.length]?.image;
  }, [idx, slides]);

  const current = slides[idx] || slides[0];

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 1.02 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "var(--hero-height, 100svh)", minHeight: 560 }}
    >
      {/* ── BACKGROUND SLIDES ── */}
      <AnimatePresence mode="sync" custom={dir}>
        <motion.div
          key={`bg-${idx}`}
          custom={dir}
          variants={{
            enter: (d) => ({ opacity: 0, scale: 1.05, x: d > 0 ? 30 : -30 }),
            center: { opacity: 1, scale: 1, x: 0 },
            exit: (d) => ({ opacity: 0, scale: 1.02, x: d > 0 ? -20 : 20 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduceMotion ? 0.35 : 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${current.image})` }}
        />
      </AnimatePresence>

      {/* ── OVERLAYS ── */}
      {/* Adaptive Overlays: Lighter/Gold-ish in light mode, Dark/Deep in dark mode */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: "var(--hero-overlay, linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 100%))",
        }}
      />
      <div className="dark:block hidden absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to right, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.7) 45%, rgba(5,5,5,0.15) 100%)",
        }}
      />
      
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-(--bg-deep)/80 via-transparent to-(--bg-deep)/20 pointer-events-none" />
      
      {/* Mobile-only: slightly darken/lighten center so text is always readable */}
      <div className="absolute inset-0 pointer-events-none sm:hidden bg-white/20 dark:bg-black/35" />

      {/* ── CONTENT ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-5 sm:px-8  lg:px-10 lg:ml-10  flex items-center">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`content-${idx}`}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduceMotion ? 0.25 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 sm:space-y-6"
            >
              {/* BADGE */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c] border border-[#c9a84c]/25 px-3 py-1.5 rounded-full bg-[rgba(201,168,76,0.06)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
                  {current.label}
                </span>
              </motion.div>

              {/* TITLE */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-display font-bold text-(--text-primary) dark:text-white leading-[1.04]"
                style={{ fontSize: "clamp(2rem, 6.5vw, 5.2rem)" }}
              >
                {(current.title || "").split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? (
                      <span className="relative">
                        <span className="gold-text">{line}</span>
                      </span>
                    ) : line}
                  </span>
                ))}
              </motion.h1>

              {/* SUBTITLE */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-(--text-secondary) dark:text-[#aaa] text-sm sm:text-base md:text-lg leading-relaxed max-w-sm"
              >
                {current.sub}
              </motion.p>

              {/* BUTTONS */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <Link to="/shop"
                  className="inline-flex items-center gap-2.5 font-bold text-sm sm:text-base text-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all hover:scale-105 hover:shadow-xl group"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c 0%, #e8c56a 50%, #c9a84c 100%)",
                    boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
                  }}
                >
                  <FiShoppingBag size={16} className="transition-transform group-hover:-translate-y-0.5" />
                  {current.cta}
                  <FiArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <Link to="/shop"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#aaa] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-5 py-3 rounded-2xl transition-all hover:bg-white/5 backdrop-blur-sm"
                >
                  <FiPlay size={13} className="fill-current" />
                  Browse All
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>


      {/* ── BOTTOM BAR ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-6 pb-6 sm:pb-8">

        {/* DOTS */}
        {slides.length > 1 && (
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > idx ? 1 : -1)}
                className="transition-all duration-500 rounded-full"
                style={{
                  width: i === idx ? 28 : 6,
                  height: 6,
                  background: i === idx
                    ? "linear-gradient(90deg,#c9a84c,#e8c56a)"
                    : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        )}

        {/* SLIDE COUNTER */}
        {slides.length > 1 && (
          <div className="flex items-center gap-1.5 text-white/40 text-xs font-mono">
            <span className="text-white font-semibold text-sm">{String(idx + 1).padStart(2, "0")}</span>
            <span>/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>
        )}
      </div>

      {/* ── SCROLL INDICATOR ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2 opacity-40">
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={reduceMotion ? undefined : { repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-white/60" />
        </motion.div>
      </div>
    </section>
  );
}
