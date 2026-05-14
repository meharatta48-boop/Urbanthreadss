import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers,
  FiLayers, FiTag, FiLogOut, FiChevronRight, FiSettings, FiExternalLink
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";

const menu = [
  { label: "Dashboard",      to: "/admin-dashboard",               Icon: FiGrid,        end: true, description: "Stats & Overview" },
  { label: "Orders",         to: "/admin-dashboard/orders",        Icon: FiShoppingBag,            description: "Manage Orders" },
  { label: "Products",       to: "/admin-dashboard/products",      Icon: FiPackage,                description: "Product Catalog" },
  { label: "Categories",     to: "/admin-dashboard/categories",    Icon: FiLayers,                 description: "Seasons & Collections" },
  { label: "Sub-Categories", to: "/admin-dashboard/subcategories", Icon: FiTag,                    description: "Product Types" },
  { label: "Users",          to: "/admin-dashboard/users",         Icon: FiUsers,                  description: "Customer Management" },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const brandName = settings?.brandName || "URBAN THREAD";
  const logoImg = settings?.logoImage ? getImageUrl(settings.logoImage) : null;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className="w-60 min-h-screen bg-(--bg-surface) border-r border-(--border) flex flex-col shrink-0 transition-colors duration-300">

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
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] text-(--text-muted)/60 uppercase tracking-widest px-3 mb-2 font-semibold">Navigation</p>

        {menu.map(({ label, to, Icon: MIcon, end, description }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={description}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                isActive
                  ? "bg-linear-to-r from-(--gold)/20 to-transparent text-(--gold) border border-(--gold)/30 shadow-[0_0_12px_rgba(201,168,76,0.15)]"
                  : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)/80 border border-transparent hover:border-(--border-light)"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-(--gold) rounded-r-full shadow-[0_0_8px_var(--gold)]" />
                )}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-(--gold)/10" : ""}`}>
                    <MIcon
                      size={15}
                      className={`shrink-0 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110 group-hover:text-(--text-primary)"}`}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-semibold truncate transition-colors ${isActive ? "text-(--gold)" : "group-hover:text-(--text-primary)"}`}>{label}</span>
                    <span className="text-[9px] text-(--text-muted)/70 truncate group-hover:text-(--text-muted)">{description}</span>
                  </div>
                </div>
                <FiChevronRight
                  size={12}
                  className={`shrink-0 transition-all duration-300 ${
                    isActive ? "opacity-100 text-(--gold)" : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}

        {/* ── CONFIG SECTION ── */}
        <div className="pt-5 pb-1">
          <p className="text-[9px] text-(--text-muted)/60 uppercase tracking-widest px-3 mb-2 font-semibold">Config</p>
          <NavLink
            to="/admin-dashboard/settings"
            title="Site Configuration"
            className={({ isActive }) =>
              `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                isActive
                  ? "bg-linear-to-r from-(--gold)/20 to-transparent text-(--gold) border border-(--gold)/30 shadow-[0_0_12px_rgba(201,168,76,0.15)]"
                  : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)/80 border border-transparent hover:border-(--border-light)"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-(--gold) rounded-r-full" />
                )}
                <div className="flex items-center gap-2.5">
                  <FiSettings
                    size={15}
                    className={`shrink-0 transition-all duration-300 ${isActive ? "" : "group-hover:rotate-90"}`}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Site Settings</span>
                    <span className="text-[9px] text-(--text-muted)/60">Configuration</span>
                  </div>
                </div>
                <FiChevronRight
                  size={11}
                  className={`shrink-0 transition-all duration-200 ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"}`}
                />
              </>
            )}
          </NavLink>
        </div>
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
      <div className="px-4 py-4 border-t border-(--border) space-y-2 bg-(--bg-surface)/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-(--bg-elevated) border border-(--border) shadow-inner">
          <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(201,168,76,0.3)]">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-(--text-primary) text-xs font-semibold truncate">{user?.name || "Admin"}</p>
            <p className="text-(--gold) text-[9px] font-medium tracking-wide uppercase">{user?.role || "Administrator"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-(--text-muted) hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30 group shadow-sm hover:shadow-[0_0_10px_rgba(239,68,68,0.1)]"
          title="Logout from admin panel"
        >
          <FiLogOut size={15} className="transition-transform group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
