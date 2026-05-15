import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiSettings,
  FiShoppingBag,
} from "react-icons/fi";

import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { settings } = useSettings();

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const brandName = settings?.brandName || "URBAN THREAD";

  const logoImg = settings?.logoImage
    ? getImageUrl(settings.logoImage)
    : null;

  const logoMobileImg = settings?.logoMobileImage
    ? getImageUrl(settings.logoMobileImage)
    : logoImg;

  const navLogoSize = Number(settings?.navLogoSize) || 40;
  const navMobileSize = Number(settings?.navLogoMobileSize) || 36;
  const navTitleSize = Number(settings?.navTitleSize) || 18;

  const showBrandName = settings?.showBrandName !== false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    };

    if (accountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (to) => location.pathname === to;

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "About", to: "/about" },
    { label: "Support", to: "/support" },
  ];

  return (
    <>
      {/* NAVBAR WRAPPER (FIXED WHITE SPACE ISSUE) */}
      <div className="w-full relative z-999 m-0 p-0 overflow-visible">
        <div className="max-w-7xl mx-auto px-0 md:px-4 overflow-visible">
          <nav
            className="flex items-center text-align-center justify-between px-4 md:px-6 pt-10 pb-3 md:py-6 border-b md:border-x md:border-t rounded-none md:rounded-3xl relative overflow-visible transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "var(--nav-border)",
              boxShadow: scrolled ? "var(--shadow-md)" : "none",
              backdropFilter: scrolled ? "blur(20px)" : "none",
              marginTop: scrolled ? "4px" : "0",
            }}
          >
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2.5 z-1000 group">
              <div
                className="hidden sm:flex items-center justify-center rounded-xl overflow-hidden transition-transform duration-500 group-hover:scale-105"
                style={{
                  width: navLogoSize,
                  height: navLogoSize,
                  backgroundColor: logoImg ? "transparent" : "var(--bg-surface)",
                  border: logoImg ? "none" : "1px solid var(--border-light)",
                }}
              >
                {logoImg ? (
                  <img
                    src={logoImg}
                    alt={brandName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="gold-text font-bold text-xl">{brandName.charAt(0)}</span>
                )}
              </div>

              <div
                className="sm:hidden flex items-center justify-center rounded-lg overflow-hidden"
                style={{
                  width: navMobileSize,
                  height: navMobileSize,
                  backgroundColor: logoMobileImg ? "transparent" : "var(--bg-surface)",
                  border: logoMobileImg ? "none" : "1px solid var(--border-light)",
                }}
              >
                {logoMobileImg ? (
                  <img
                    src={logoMobileImg}
                    alt={brandName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="gold-text font-bold text-lg">{brandName.charAt(0)}</span>
                )}
              </div>

              {showBrandName && (
                <span
                  className="font-display tracking-widest font-bold hidden sm:block truncate"
                  style={{
                    fontSize: navTitleSize,
                    color: "var(--text-primary)",
                  }}
                >
                  {brandName.split(" ")[0]}
                  {brandName.split(" ").length > 1 && (
                    <span className="gold-text ml-1.5">{brandName.split(" ").slice(1).join(" ")}</span>
                  )}
                </span>
              )}
            </Link>

            {/* NAV LINKS */}
            <div
              className="hidden md:flex gap-1 items-center bg-(--bg-surface)/50 p-1 rounded-full border border-(--border-light) backdrop-blur-md"
            >
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="relative px-5 py-2 text-[0.82rem] font-bold tracking-wide rounded-full transition-all duration-300 overflow-hidden group"
                  style={{
                    color: isActive(l.to) ? "black" : "var(--text-secondary)",
                  }}
                >
                  {isActive(l.to) && (
                    <motion.div
                      layoutId="nav-pill-active"
                      className="absolute inset-0 gold-gradient rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* CART */}
              <Link
                to="/cart"
                className="relative z-1000 p-2.5 rounded-full transition-all hover:scale-105 active:scale-95 bg-(--bg-elevated) border border-(--border-light)"
              >
                <FiShoppingBag size={20} style={{ color: "var(--text-primary)" }} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 gold-gradient text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg ring-2 ring-(--bg-card)"
                      style={{ width: 20, height: 20 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* USER DROPDOWN */}
              <div className="hidden md:flex relative" ref={dropdownRef}>
                {!user ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="text-xs font-bold px-4 py-2 rounded-full hover:bg-(--bg-elevated) transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-gold px-5 py-2 rounded-full text-xs font-bold shadow-lg"
                    >
                      Join
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full transition-all group bg-(--bg-elevated) border border-(--border-light) hover:shadow-md"
                    >
                      <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center text-black font-black text-xs shadow-inner">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-(--text-primary) group-hover:text-(--gold) transition-colors">
                        {user.name?.split(" ")[0]}
                      </span>
                      <motion.div animate={{ rotate: accountOpen ? 180 : 0 }}>
                        <FiChevronDown size={14} className="text-(--text-muted)" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-[calc(100%+12px)] w-64 bg-(--bg-card) border border-(--border) shadow-2xl rounded-2xl overflow-hidden z-10000 backdrop-blur-xl"
                        >
                          <div className="p-4 bg-(--bg-surface)/50 border-b border-(--border)">
                            <p className="font-bold text-(--text-primary) truncate">{user.name}</p>
                            <p className="text-xs text-(--text-muted) truncate">{user.email}</p>
                          </div>

                          <div className="p-2 space-y-1">
                            <Link
                              to="/my-orders"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-(--bg-elevated) text-(--text-secondary) transition-colors"
                            >
                              <FiShoppingBag size={16} /> My Orders
                            </Link>

                            {user.role === "admin" && (
                              <Link
                                to="/admin-dashboard"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl hover:bg-(--gold)/10 text-(--gold) transition-colors"
                              >
                                <FiSettings size={16} /> Admin Panel
                              </Link>
                            )}
                          </div>

                          <div className="p-2 border-t border-(--border)">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <FiLogOut size={16} /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* HAMBURGER */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden flex items-center justify-center p-2.5 rounded-full transition-all active:scale-90 bg-(--bg-elevated) border border-(--border-light) z-1100"
                style={{ color: "var(--text-primary)" }}
              >
                <motion.div animate={{ rotate: open ? 90 : 0 }}>
                  {open ? <FiX size={22} /> : <FiMenu size={22} />}
                </motion.div>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* MOBILE MENU FIX */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-9998 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />

            {/* DRAWER */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85vw] max-w-sm h-full bg-white z-9999 shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-(--border)">
                <span className="font-display font-bold tracking-widest text-lg text-(--text-primary)">
                  MENU
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full bg-(--bg-elevated)"
                >
                  <FiX size={20} className="text-(--text-primary)" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all border border-transparent"
                    style={{
                      backgroundColor: isActive(l.to) ? "var(--bg-elevated)" : "transparent",
                      color: isActive(l.to) ? "var(--gold)" : "var(--text-primary)",
                      borderColor: isActive(l.to) ? "var(--gold)/20" : "transparent",
                    }}
                  >
                    {l.label}
                    {isActive(l.to) && <div className="w-1.5 h-1.5 rounded-full bg-(--gold) shadow-[0_0_8px_var(--gold)]" />}
                  </Link>
                ))}

                {!user && (
                  <div className="pt-6 grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="p-4 rounded-2xl bg-(--bg-elevated) text-center font-bold text-sm text-(--text-primary)"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="p-4 rounded-2xl btn-gold text-center font-bold text-sm"
                    >
                      Join
                    </Link>
                  </div>
                )}
              </div>

              {user && (
                <div className="p-6 border-t border-(--border) bg-(--bg-surface)/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 gold-gradient rounded-full flex items-center justify-center text-black font-black text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-(--text-primary)">{user.name}</p>
                      <p className="text-xs text-(--text-muted)">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/my-orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-(--bg-elevated) text-(--text-primary) font-bold"
                    >
                      <FiShoppingBag /> My Orders
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-(--gold)/10 text-(--gold) font-bold"
                      >
                        <FiSettings /> Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold mt-4"
                    >
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}