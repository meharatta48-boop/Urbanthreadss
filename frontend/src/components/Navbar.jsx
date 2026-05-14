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


  const showBrandName = settings?.showBrandName !== false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };



  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "About", to: "/about" },
    { label: "Support", to: "/support" },
  ];

  return (
    <>
      {/* NAVBAR WRAPPER (FIXED WHITE SPACE ISSUE) */}
      <div className="w-full relative z-999 m-0 p-0">
        <div className="max-w-7xl mx-auto px-0 md:px-4">
          <nav
            className="flex items-center justify-between px-4 md:px-6 py-3 md:py-3.5 border-b md:border-x md:border-t rounded-none md:rounded-3xl relative overflow-visible"
            style={{
              backgroundColor: scrolled
                ? "var(--nav-bg-scrolled)"
                : "var(--bg-deep)",
              borderColor: "var(--nav-border)",
              boxShadow: scrolled ? "var(--shadow-md)" : "none",
              backdropFilter: scrolled ? "blur(20px)" : "none",
            }}
          >
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 z-1000">
              <div
                className="hidden sm:flex items-center justify-center"
                style={{ width: navLogoSize, height: navLogoSize }}
              >
                {logoImg ? (
                  <img src={logoImg} className="w-full h-full object-contain" />
                ) : (
                  <span>{brandName.charAt(0)}</span>
                )}
              </div>

              <div
                className="sm:hidden flex items-center justify-center"
                style={{ width: navMobileSize, height: navMobileSize }}
              >
                {logoMobileImg ? (
                  <img src={logoMobileImg} className="w-full h-full object-contain" />
                ) : (
                  <span>{brandName.charAt(0)}</span>
                )}
              </div>

              {showBrandName && (
                <span className="hidden sm:block font-bold">
                  {brandName}
                </span>
              )}
            </Link>

            {/* NAV LINKS */}
            <div className="hidden md:flex gap-2 items-center">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="px-4 py-2 text-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">

              {/* CART */}
              <Link to="/cart" className="relative z-1000">
                <FiShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* USER DROPDOWN */}
              <div className="hidden md:flex relative" ref={dropdownRef}>

                {!user ? (
                  <Link to="/login">Login</Link>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full"
                    >
                      {user.name?.charAt(0)}
                      <FiChevronDown />
                    </button>

                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-xl z-9999"
                        >
                          <div className="p-3 border-b">
                            <p className="font-bold">{user.name}</p>
                            <p className="text-xs">{user.email}</p>
                          </div>

                          <Link to="/my-orders" className="block px-4 py-2">
                            My Orders
                          </Link>

                          {user.role === "admin" && (
                            <Link to="/admin-dashboard" className="block px-4 py-2">
                              Admin Panel
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-500"
                          >
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* HAMBURGER FIX */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden z-1100"
              >
                {open ? <FiX size={22} /> : <FiMenu size={22} />}
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
              className="fixed inset-0 bg-black/40 z-998"
              onClick={() => setOpen(false)}
            />

            {/* DRAWER */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 w-[80vw] max-w-sm h-full bg-white z-9999 p-5 overflow-y-auto"
            >
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-3"
                >
                  {l.label}
                </Link>
              ))}

              {user && (
                <button
                  onClick={handleLogout}
                  className="mt-5 text-red-500"
                >
                  Logout
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}