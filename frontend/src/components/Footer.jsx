import { FiInstagram, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin, FiMessageCircle } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
const API_BASE = SERVER_URL;

export default function Footer() {
  const { settings } = useSettings();

  const brandName      = settings?.brandName      || "URBAN THREAD";
  const logoImg        = settings?.logoImage       ? getImageUrl(settings.logoImage)       : null;
  const footerLogoSize = Number(settings?.footerLogoSize) || 60;
  const showBrandName  = settings?.showBrandName !== false;
  const socialIconSz   = Number(settings?.socialIconSize) || 18;

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
    { label: "About",     to: "/about" },
    { label: "My Orders", to: "/my-orders" },
    { label: "Cart",      to: "/cart" },
    { label: "Support",   to: "/support" },
  ];

  const categories = [
    { label: "Summer Collection", to: "/shop?category=summer" },
    { label: "Winter Collection", to: "/shop?category=winter" },
    { label: "Men",               to: "/shop?sub=men" },
    { label: "Women",             to: "/shop?sub=women" },
    { label: "Kids",              to: "/shop?sub=kids" },
  ];

  return (
    <footer style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">

        {/* WHATSAPP TOP STRIP */}
        {settings?.whatsapp && (
          <a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 mb-10 rounded-2xl px-4 sm:px-5 py-4 transition-all group"
            style={{
              background: "rgba(37,211,102,0.06)",
              border: "1px solid rgba(37,211,102,0.15)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.06)"}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37,211,102,0.12)" }}>
              <FiMessageCircle size={17} style={{ color: "#25d366" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>WhatsApp pe Support Hasil Karein</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>+{settings.whatsapp} — Online Support</p>
            </div>
            <span
              className="ml-auto text-xs border px-2 sm:px-3 py-1.5 rounded-xl transition-all flex-shrink-0 hidden sm:inline-flex"
              style={{ color: "#25d366", borderColor: "rgba(37,211,102,0.2)" }}
            >
              Chat Karein →
            </span>
          </a>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-12">

          {/* BRAND */}
          <div className="col-span-2 sm:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              {/* Logo — responsive size */}
              <div className="flex-shrink-0 rounded-xl overflow-hidden relative"
                style={{ width: footerLogoSize, height: footerLogoSize }}>
                <div className="absolute inset-0 gold-gradient flex items-center justify-center rounded-xl transition-opacity duration-300"
                  style={{ opacity: logoImg ? 0 : 1 }}>
                  <span className="text-black font-bold font-display"
                    style={{ fontSize: Math.max(12, footerLogoSize * 0.4) }}>{brandName.charAt(0)}</span>
                </div>
                {logoImg && (
                  <img src={logoImg} alt={brandName} className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                )}
              </div>

              {showBrandName && (
                <span className="font-display tracking-[0.15em] font-bold"
                  style={{ fontSize: Math.max(14, footerLogoSize * 0.38), color: "var(--text-primary)" }}>
                  {brandName.split(" ")[0]}
                  {brandName.split(" ").length > 1 && (
                    <span className="gold-text"> {brandName.split(" ").slice(1).join(" ")}</span>
                  )}
                </span>
              )}
            </div>

            <p className="leading-relaxed max-w-xs text-sm" style={{ color: "var(--text-muted)" }}>
              {settings?.footerTagline || "Pakistan ka premium streetwear brand. Har piece ek statement hai — apna style define karo."}
            </p>

            {/* SOCIAL ICONS */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Follow Us</p>
              <div className="flex gap-2">
                {(socials.length > 0 ? socials : [
                  { Icon: FiInstagram, href: "#", label: "Instagram", color: "#e1306c" },
                  { Icon: FiFacebook,  href: "#", label: "Facebook",  color: "#1877f2" },
                  { Icon: FaTiktok,    href: "#", label: "TikTok",    color: "#69c9d0" },
                  { Icon: FiYoutube,   href: "#", label: "YouTube",   color: "#ff0000" },
                ]).map(({ Icon, href, label, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}10`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
                  >
                    <Icon size={socialIconSz} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm flex items-center gap-1.5 group transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                  >
                    <span className="w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--gold)" }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CATEGORIES */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm flex items-center gap-1.5 group transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                  >
                    <span className="w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--gold)" }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>Contact</h4>
            <ul className="space-y-3 mb-4">
              {contacts.map(({ Icon, label, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      className="flex items-start gap-2.5 text-sm transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                    >
                      <Icon size={14} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                      {label}
                    </a>
                  ) : (
                    <span className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                      <Icon size={14} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* SUPPORT LINK */}
            <Link to="/support"
              className="flex items-center gap-2 text-xs rounded-xl px-3 py-2.5 transition-all"
              style={{ color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <FiMessageCircle size={13} /> Live Support
            </Link>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>🇵🇰 Made in Pakistan</span>
            <span>· COD Available</span>
            <span>· Fast Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
