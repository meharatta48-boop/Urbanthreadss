import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart, FiMenu, FiX, FiLogOut,
  FiChevronDown, FiSettings, FiShoppingBag,
  FiSun, FiMoon, FiUser
} from "react-icons/fi";

import api, { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
const API_BASE = SERVER_URL;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const brandName = settings?.brandName || "URBAN THREAD";
  const logoImg = settings?.logoImage ? getImageUrl(settings.logoImage) : null;
  const logoMobileImg = settings?.logoMobileImage ? getImageUrl(settings.logoMobileImage) : logoImg;
  const navLogoSize = Number(settings?.navLogoSize) || 40;
  const navMobileSize = Number(settings?.navLogoMobileSize) || 36;
  const navTitleSize = Number(settings?.navTitleSize) || 18;
  const showBrandName = settings?.showBrandName !== false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => { setOpen(false); setAccountOpen(false); }, [location]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const handleLogout = () => { logout(); navigate("/"); };
  const isActive = (to) => location.pathname === to;

  const [dynamicLinks, setDynamicLinks] = useState([]);

  useEffect(() => {
    api.get("/nav-links").then(res => {
      if (res.data?.success && res.data?.links?.length > 0) {
        setDynamicLinks(res.data.links.filter(l => l.isVisible));
      }
    }).catch(() => {});
  }, []);

  const navLinks = dynamicLinks.length > 0 
    ? dynamicLinks.map(l => ({ label: l.label, to: l.url, isExternal: l.isExternal }))
    : [
        { label: "Home", to: "/" },
        { label: "Shop", to: "/shop" },
        { label: "About Us", to: "/page/about-us" },
        { label: "Return Policy", to: "/page/return-exchange-policy" },
        { label: "Contact Us", to: "/support" },
      ];

  const isDark = theme === "dark";

  return (
    <>
      <div
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${scrolled ? 'py-1' : 'py-1'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav
            className={`flex items-center justify-between transition-all duration-500 ease-in-out rounded-2xl md:rounded-3xl px-4 py-2 sm:px-6 sm:py-3 border ${scrolled ? 'shadow-lg shadow-black/5 border-(--glass-border)' : 'border-(--border-light) shadow-sm'}`}
            style={{
              background: 'transparent',
              backdropFilter: scrolled ? 'blur(24px)' : 'none',
            }}
          >
            {/* ── LOGO ── */}
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0 group">
              {/* Desktop logo */}
              <div className="hidden sm:flex shrink-0 rounded-xl overflow-hidden items-center justify-center relative transition-transform duration-500 group-hover:scale-105 shadow-sm"
                style={{ width: navLogoSize, height: navLogoSize }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-300"
                  style={{ opacity: logoImg ? 0 : 1, pointerEvents: "none" }}>
                  <span className="gold-text font-bold font-display leading-none"
                    style={{ fontSize: Math.max(16, navLogoSize * 0.6) }}>
                    {brandName.charAt(0)}
                  </span>
                </div>
                {logoImg && (
                  <img src={logoImg} alt={brandName}
                    className="w-full h-full object-contain transition-opacity duration-300"
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                )}
              </div>

              {/* Mobile logo */}
              <div className="flex sm:hidden shrink-0 rounded-xl overflow-hidden items-center justify-center relative shadow-sm"
                style={{ width: navMobileSize, height: navMobileSize }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-300"
                  style={{ opacity: logoMobileImg ? 0 : 1, pointerEvents: "none" }}>
                  <span className="gold-text font-bold font-display leading-none"
                    style={{ fontSize: Math.max(14, navMobileSize * 0.6) }}>
                    {brandName.charAt(0)}
                  </span>
                </div>
                {logoMobileImg && (
                  <img src={logoMobileImg} alt={brandName}
                    className="w-full h-full object-contain transition-opacity duration-300"
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                )}
              </div>

              {/* Brand name text */}
              {showBrandName && (
                <span
                  className="font-display tracking-widest font-bold hidden sm:block truncate transition-colors duration-300 group-hover:text-(--gold)"
                  style={{ fontSize: navTitleSize, color: "var(--text-primary)" }}
                >
                  {brandName.split(" ")[0]}
                  {brandName.split(" ").length > 1 && (
                    <span className="gold-text ml-1.5">{brandName.split(" ").slice(1).join(" ")}</span>
                  )}
                </span>
              )}
            </Link>

            {/* ── DESKTOP NAV LINKS ── */}
            <div className="hidden md:flex items-center gap-1.5 bg-(--bg-elevated) p-1.5 rounded-full border border-(--border-light) shadow-inner">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-5 py-2 text-xs font-semibold tracking-wide rounded-full transition-all duration-300 group"
                  style={{
                    color: isActive(link.to) ? "#000" : "var(--text-secondary)",
                  }}
                >
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 gold-gradient rounded-full shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-(--text-primary)"
                    style={{ color: isActive(link.to) ? '#050505' : '' }}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* ── RIGHT ACTIONS ── */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="relative p-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-(--gold)/10"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3, ease: "backOut" }}
                    style={{ display: "flex" }}
                  >
                    {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {/* CART */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-(--gold)/10"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <FiShoppingCart size={17} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 text-[10px] font-extrabold text-black gold-gradient rounded-full flex items-center justify-center shadow-lg shadow-(--gold)/30 border-2 border-(--bg-card)"
                      style={{ width: 22, height: 22 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* DESKTOP: USER MENU or LOGIN */}
              <div className="hidden md:flex items-center ml-1">
                {!user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/login"
                      className="text-sm font-bold px-4 py-2.5 rounded-full transition-all duration-300"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "var(--text-primary)";
                        e.currentTarget.style.background = "var(--bg-elevated)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Log In
                    </Link>
                    <Link to="/signup" className="btn-gold py-2.5! px-5! rounded-full! shadow-lg shadow-(--gold)/20">
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full transition-all duration-300 group shadow-sm hover:shadow-md"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-light)"
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-light)"}
                    >
                      <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center text-black font-extrabold text-xs font-display shadow-inner">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold hidden lg:block max-w-22.5 truncate transition-colors group-hover:text-(--gold)" style={{ color: "var(--text-primary)" }}>
                        {user.name?.split(" ")[0]}
                      </span>
                      <motion.div
                        animate={{ rotate: accountOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <FiChevronDown size={14} style={{ color: "var(--text-muted)" }} className="group-hover:text-(--gold) transition-colors" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="absolute right-0 top-[calc(100%+12px)] w-56 rounded-2xl shadow-2xl overflow-hidden z-50 glass-card"
                        >
                          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                            <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                            <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                            <div className="mt-2 inline-block badge-gold text-[0.6rem]! px-2! py-0.5!">{user.role}</div>
                          </div>

                          <div className="p-2 space-y-1">
                            <Link
                              to="/my-orders"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                              style={{ color: "var(--text-secondary)" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
                            >
                              <FiShoppingBag size={15} className="text-(--gold)" /> My Orders
                            </Link>

                            {user.role === "admin" && (
                              <Link
                                to="/admin-dashboard"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                                style={{ color: "var(--gold)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.08)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <FiSettings size={15} /> Admin Panel
                              </Link>
                            )}
                          </div>

                          <div className="p-2" style={{ borderTop: "1px solid var(--border)" }}>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                            >
                              <FiLogOut size={15} /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* MOBILE: Hamburger */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2.5 rounded-full transition-all bg-(--bg-elevated) border border-(--border-light) hover:border-(--gold) hover:text-(--gold)"
                style={{ color: "var(--text-secondary)" }}
              >
                <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  {open ? <FiX size={18} /> : <FiMenu size={18} />}
                </motion.div>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-60 md:hidden"
              style={{ background: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)" }}
              onClick={() => setOpen(false)}
            />

            {/* Premium Drawer */}
            <motion.div
              initial={{ x: "100%", borderTopLeftRadius: "100px", borderBottomLeftRadius: "100px" }}
              animate={{ x: 0, borderTopLeftRadius: "24px", borderBottomLeftRadius: "24px" }}
              exit={{ x: "100%", borderTopLeftRadius: "100px", borderBottomLeftRadius: "100px" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-2 bottom-2 right-2 w-[85vw] max-w-85 z-70 md:hidden shadow-2xl glass-card overflow-hidden flex flex-col"
              style={{
                background: "var(--drawer-bg)",
                border: "1px solid var(--drawer-border)",
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 relative z-10" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    {logoImg ? (
                      <img src={logoImg} alt={brandName} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="gold-text font-extrabold font-display text-2xl">{brandName.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-display font-bold text-base tracking-wider" style={{ color: "var(--text-primary)" }}>{brandName}</span>
                </div>
                <button onClick={() => setOpen(false)}
                  className="p-2 rounded-full bg-(--bg-elevated) border border-(--border-light) hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                  <FiX size={18} />
                </button>
              </div>

              {/* NAV LINKS */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 relative z-10 custom-scrollbar">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center py-4 px-5 rounded-2xl text-base font-bold transition-all relative overflow-hidden group"
                    style={{
                      color: isActive(link.to) ? "#000" : "var(--text-secondary)",
                    }}
                  >
                    {isActive(link.to) ? (
                      <motion.div layoutId="mobile-nav-pill" className="absolute inset-0 gold-gradient opacity-100" />
                    ) : (
                      <div className="absolute inset-0 bg-(--bg-elevated) opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className="relative z-10 flex items-center w-full justify-between">
                      {link.label}
                      {isActive(link.to) && <span className="w-2 h-2 rounded-full bg-black block" />}
                    </span>
                  </Link>
                ))}
              </div>

              {/* USER SECTION (BOTTOM) */}
              <div className="p-4 relative z-10" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                {!user ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" className="btn-outline w-full py-3.5! rounded-xl! text-sm!">Log In</Link>
                    <Link to="/signup" className="btn-gold w-full py-3.5! rounded-xl! text-sm! shadow-lg shadow-(--gold)/20">Create Account</Link>
                  </div>
                ) : (
                  <div className="bg-(--bg-card) rounded-2xl p-4 border border-(--border) shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-black font-extrabold shadow-inner">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-(--text-primary)">{user.name}</p>
                        <p className="text-[11px] font-medium text-(--text-muted) truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Link to="/my-orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-(--bg-elevated) transition-colors text-sm font-medium text-(--text-secondary) hover:text-(--text-primary)">
                        <div className="w-8 h-8 rounded-lg bg-(--bg-surface) flex items-center justify-center text-(--gold)"><FiShoppingBag size={14} /></div>
                        My Orders
                      </Link>

                      {user.role === "admin" && (
                        <Link to="/admin-dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(201,168,76,0.08)] transition-colors text-sm font-bold text-(--gold)">
                          <div className="w-8 h-8 rounded-lg bg-[rgba(201,168,76,0.15)] flex items-center justify-center"><FiSettings size={14} /></div>
                          Admin Panel
                        </Link>
                      )}

                      <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium text-(--text-muted) hover:text-red-500">
                        <div className="w-8 h-8 rounded-lg bg-(--bg-surface) hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center"><FiLogOut size={14} /></div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
