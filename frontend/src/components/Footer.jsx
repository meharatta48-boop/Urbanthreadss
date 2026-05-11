import { FiInstagram, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin, FiMessageCircle, FiArrowUp } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";

import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
const API_BASE = SERVER_URL;

export default function Footer() {
  const { settings } = useSettings();

  const brandName      = settings?.brandName      || "URBAN THREAD";
  const logoImg        = settings?.logoImage       ? getImageUrl(settings.logoImage)       : null;
  const footerLogoSize = Number(settings?.footerLogoSize) || 60;
  const showBrandName  = settings?.showBrandName !== false;
  const socialIconSz   = Number(settings?.socialIconSize) || 20;

  const socials = [
    { Icon: FiInstagram, href: settings?.instagram || "#",  label: "Instagram",  color: "#e1306c" },
    { Icon: FiFacebook,  href: settings?.facebook  || "#",  label: "Facebook",   color: "#1877f2" },
    { Icon: FaTiktok,    href: settings?.tiktok    || "#",  label: "TikTok",     color: "#69c9d0" },
    { Icon: FiYoutube,   href: settings?.youtube   || "#",  label: "YouTube",    color: "#ff0000" },
  ].filter((s) => s.href && s.href !== "#");

  const contacts = [
    { Icon: FiPhone,    label: settings?.phone   || "+92 300 1234567",   href: `tel:${settings?.phone}` },
    { Icon: FiMail,     label: settings?.email   || "info@urbanthread.pk", href: `mailto:${settings?.email}` },
    { Icon: FiMapPin,   label: settings?.address || "Lahore, Pakistan",   href: null },
  ];

  const quickLinks = [
    { label: "Home",      to: "/" },
    { label: "Shop",      to: "/shop" },
    { label: "About Us",  to: "/about" },
    { label: "My Orders", to: "/my-orders" },
    { label: "Track Order", to: "/track-order" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Return Policy", to: "/returns" },
    { label: "Shipping Info", to: "/shipping" },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-(--bg-deep) transition-colors duration-500 border-t border-(--border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">

        {/* TOP SECTION: BRAND & WHATSAPP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-start">
          
          {/* BRAND INFO */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex flex-col gap-6">
              <Link to="/" className="flex items-center gap-4 group w-max">
                <div className="shrink-0 rounded-2xl overflow-hidden relative shadow-2xl transition-transform group-hover:scale-105"
                  style={{ width: footerLogoSize, height: footerLogoSize }}>
                  <div className="absolute inset-0 gold-gradient flex items-center justify-center rounded-2xl">
                    <span className="text-black font-bold font-display"
                    style={{ fontSize: Math.max(12, footerLogoSize * 0.45) }}>{brandName.charAt(0)}</span>
                  </div>
                  {logoImg && (
                    <img src={logoImg} alt={brandName} className="w-full h-full object-contain relative z-10"
                      onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                  )}
                </div>
                {showBrandName && (
                  <span className="font-display tracking-[0.2em] font-black text-(--text-primary)"
                    style={{ fontSize: Math.max(16, footerLogoSize * 0.4) }}>
                    {brandName.split(" ")[0]}
                    {brandName.split(" ").length > 1 && (
                      <span className="gold-text italic"> {brandName.split(" ").slice(1).join(" ")}</span>
                    )}
                  </span>
                )}
              </Link>
              <p className="text-lg leading-relaxed text-(--text-secondary) max-w-md font-light italic">
                {settings?.footerTagline || "Pakistan ka premium streetwear brand. Har piece ek statement hai — apna style define karo."}
              </p>
            </div>

            {/* SOCIAL CONNECT */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-(--gold)">Connect With Us</p>
              <div className="flex flex-wrap gap-3">
                {socials.map((s) => (
                  <motion.a 
                    key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -4 }}
                    className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all bg-(--bg-surface) border border-(--border) text-(--text-muted) shadow-xl shadow-black/5"
                    style={{ "--hover-color": s.color }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.color}60`; e.currentTarget.style.color = s.color; e.currentTarget.style.background = `${s.color}05`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
                  >
                    <s.Icon size={socialIconSz} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* WHATSAPP SUPPORT CARD */}
          <div className="lg:col-span-7">
            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank" rel="noopener noreferrer"
                className="group relative block p-8 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-3xl hover:shadow-(--gold)/5"
                style={{
                  background: "linear-gradient(135deg, rgba(37,211,102,0.08) 0%, rgba(37,211,102,0.02) 100%)",
                  border: "1px solid rgba(37,211,102,0.15)",
                }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#25d366]/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-[#25d366] flex items-center justify-center shadow-2xl shadow-[#25d366]/30 group-hover:scale-110 transition-transform duration-500">
                      <FiMessageCircle size={32} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-(--text-primary) mb-1">WhatsApp Support</h4>
                      <p className="text-sm text-(--text-muted)">Batain karein hamari team se — Online 24/7</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#25d366]">Always Live</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span className="text-lg font-display font-bold text-(--text-primary)">+{settings.whatsapp}</span>
                    <span className="btn-gold group-hover:bg-white group-hover:text-black group-hover:border-white transition-all px-6 py-2.5 rounded-full text-xs shadow-xl">
                      Start Chat Now
                    </span>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* MIDDLE SECTION: LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          
          {/* NAVIGATION */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-(--text-primary)">Store Navigation</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-(--text-muted) hover:text-(--gold) transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-(--gold) scale-0 group-hover:scale-100 transition-transform" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-(--text-primary)">Information</h4>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-(--text-muted) hover:text-(--gold) transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-(--gold) scale-0 group-hover:scale-100 transition-transform" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="col-span-2 space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-(--text-primary)">Get In Touch</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {contacts.map((c) => (
                <div key={c.label} className="space-y-2">
                  <div className="flex items-center gap-2 text-(--gold)">
                    <c.Icon size={14} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black">
                      {c.label.includes("@") ? "Email Us" : c.label.includes("+") ? "Call Us" : "Visit Us"}
                    </span>
                  </div>
                  {c.href ? (
                    <a href={c.href} className="block text-sm font-medium text-(--text-muted) hover:text-(--text-primary) transition-colors">{c.label}</a>
                  ) : (
                    <p className="text-sm font-medium text-(--text-muted)">{c.label}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Link to="/support" className="inline-flex items-center gap-3 text-xs font-bold px-6 py-3 rounded-full border border-(--gold)/20 bg-(--gold)/5 text-(--gold) hover:bg-(--gold) hover:text-black transition-all">
                <FiMessageCircle size={14} /> Open Support Ticket
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: COPYRIGHT & SCROLL */}
        <div className="pt-10 border-t border-(--border) flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-(--text-muted)">
              © {new Date().getFullYear()} {brandName} Collection. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-black text-(--text-muted)/60">
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-(--gold)" /> Made in Pakistan</span>
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-(--gold)" /> Secure Checkout</span>
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-(--gold)" /> Nationwide Shipping</span>
            </div>
          </div>

          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl border border-(--border) flex items-center justify-center text-(--text-muted) group-hover:text-(--gold) group-hover:border-(--gold)/40 bg-(--bg-surface) shadow-xl shadow-black/5">
              <FiArrowUp size={20} />
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-(--text-muted)">Back To Top</span>
          </button>
        </div>

      </div>
    </footer>
  );
}
