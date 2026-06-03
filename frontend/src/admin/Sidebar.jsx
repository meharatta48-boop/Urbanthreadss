import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers,
  FiLayers, FiTag, FiLogOut, FiChevronRight, FiSettings, FiExternalLink,
  FiBarChart2, FiTarget, FiBookOpen, FiCpu, FiSearch, FiZap,
  FiShield, FiDollarSign, FiMail, FiChevronDown
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { getImageUrl } from "../utils/imageUrl";
import { useEffect, useState } from "react";
import api from "../services/api";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",      to: "/admin-dashboard",               Icon: FiGrid,        end: true, description: "Stats & Overview" },
      { label: "Analytics",      to: "/admin-dashboard/analytics",     Icon: FiBarChart2,              description: "Charts & Insights" },
    ]
  },
  {
    label: "Catalog",
    items: [
      { label: "Orders",         to: "/admin-dashboard/orders",        Icon: FiShoppingBag,            description: "Manage Orders", badge: "pending" },
      { label: "Products",       to: "/admin-dashboard/products",      Icon: FiPackage,                description: "Product Catalog" },
      { label: "Combo Offers",   to: "/admin-dashboard/combos",        Icon: FiTag,                    description: "Mix & Match Deals" },
      { label: "Categories",     to: "/admin-dashboard/categories",    Icon: FiLayers,                 description: "Seasons & Collections" },
      { label: "Sub-Categories", to: "/admin-dashboard/subcategories", Icon: FiTag,                    description: "Product Types" },
    ]
  },
  {
    label: "Customers",
    items: [
      { label: "Users",          to: "/admin-dashboard/users",         Icon: FiUsers,                  description: "Customer Management" },
    ]
  },
  {
    label: "Growth",
    items: [
      { label: "Marketing",      to: "/admin-dashboard/marketing",     Icon: FiTarget,                 description: "Coupons, Flash Sales" },
      { label: "AI Tools",       to: "/admin-dashboard/ai-tools",      Icon: FiCpu,                    description: "AI Descriptions & SEO" },
      { label: "SEO Center",     to: "/admin-dashboard/seo",           Icon: FiSearch,                 description: "Meta, Sitemap, Robots" },
      { label: "Automations",    to: "/admin-dashboard/automations",   Icon: FiMail,                   description: "Email, WhatsApp, SMS" },
    ]
  },
  {
    label: "Content",
    items: [
      { label: "Content CMS",    to: "/admin-dashboard/content",       Icon: FiBookOpen,               description: "Blog, FAQs, Pages" },
    ]
  },
  {
    label: "Finance",
    items: [
      { label: "Finance Center", to: "/admin-dashboard/finance",       Icon: FiDollarSign,             description: "P&L, Expenses, Tax" },
    ]
  },
  {
    label: "Config",
    items: [
      { label: "Site Settings",  to: "/admin-dashboard/settings",      Icon: FiSettings,               description: "Configuration" },
      { label: "Security",       to: "/admin-dashboard/security",      Icon: FiShield,                 description: "Logs, Roles, Backups" },
    ]
  },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const brandName = settings?.brandName || "URBAN THREAD";
  const logoImg = settings?.logoImage ? getImageUrl(settings.logoImage) : null;
  const [pendingCount, setPendingCount] = useState(0);
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get("/stats/advanced");
        setPendingCount(res?.data?.data?.ordersByStatus?.pending || 0);
      } catch { /* silent */ }
    };
    fetchPending();
    const id = setInterval(fetchPending, 60000);
    return () => clearInterval(id);
  }, []);

  const toggleGroup = (label) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className="w-60 h-screen max-h-screen overflow-hidden bg-(--bg-surface) border-r border-(--border) flex flex-col shrink-0 transition-colors duration-300">

      {/* ── BRAND LOGO ── */}
      <div className="px-5 py-5 border-b border-(--border)">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
            <div className={`absolute inset-0 gold-gradient flex items-center justify-center rounded-xl transition-opacity duration-300${logoImg ? " opacity-0" : ""}`}>
              <span className="text-black font-display font-bold text-sm">{brandName.charAt(0)}</span>
            </div>
            {logoImg && (
              <img
                src={logoImg}
                alt={brandName}
                className="w-full h-full object-contain relative z-10"
                onError={(e) => { e.currentTarget.style.opacity = "0"; }}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-xs text-(--text-primary) tracking-wider truncate">{brandName}</div>
            <div className="text-[9px] text-(--text-muted) uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
              Admin Panel · Enterprise
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto admin-sidebar-scroll">
        {navGroups.map(({ label, items }) => {
          const isGroupCollapsed = collapsed[label];
          const isGroupActive = items.some(item => {
            if (item.end) return location.pathname === item.to;
            return location.pathname.startsWith(item.to);
          });

          return (
            <div key={label} className="space-y-0.5">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(label)}
                className="w-full flex items-center justify-between px-3 py-1 rounded-lg group"
              >
                <p className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${isGroupActive ? "text-(--gold)" : "text-(--text-muted)/60"}`}>
                  {label}
                </p>
                <FiChevronDown
                  size={10}
                  className={`text-(--text-muted)/40 transition-transform duration-200 ${isGroupCollapsed ? "-rotate-90" : ""}`}
                />
              </button>

              {/* Group Items */}
              {!isGroupCollapsed && items.map(({ label: itemLabel, to, Icon: MIcon, end, description, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={description}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                      isActive
                        ? "bg-(--gold)/10 text-(--gold) border border-(--gold)/20 shadow-sm"
                        : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) border border-transparent hover:border-(--border-light)"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-(--gold) rounded-r-full" />
                      )}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MIcon
                          size={14}
                          className={`shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium truncate">{itemLabel}</span>
                          <span className="text-[9px] text-(--text-muted)/60 truncate">{description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {badge === "pending" && pendingCount > 0 && (
                          <span className="text-[9px] font-black text-black gold-gradient px-1.5 py-0.5 rounded-full min-w-4.5 text-center animate-pulse">
                            {pendingCount > 99 ? "99+" : pendingCount}
                          </span>
                        )}
                        <FiChevronRight
                          size={11}
                          className={`transition-all duration-200 ${
                            isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"
                          }`}
                        />
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* ── VIEW SITE LINK ── */}
      <div className="px-3 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 w-full rounded-xl text-xs text-(--text-muted) hover:text-(--gold) hover:bg-(--gold)/5 transition-all border border-transparent hover:border-(--gold)/20 group"
        >
          <FiExternalLink size={12} className="group-hover:scale-110 transition-transform" />
          <span>View Live Store</span>
        </a>
      </div>

      {/* ── USER + LOGOUT ── */}
      <div className="px-3 py-3 border-t border-(--border) space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-(--bg-elevated) border border-(--border)">
          <div className="w-7 h-7 gold-gradient rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-(--text-primary) text-xs font-semibold truncate">{user?.name || "Admin"}</p>
            <p className="text-(--text-muted) text-[9px] capitalize">{user?.role || "Administrator"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-sm text-(--text-muted) hover:text-red-500 hover:bg-red-500/8 transition-all border border-transparent hover:border-red-500/20 group"
          title="Logout from admin panel"
        >
          <FiLogOut size={14} className="transition-transform group-hover:translate-x-0.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
