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
              `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-(--gold)/10 text-(--gold) border border-(--gold)/20 shadow-sm"
                  : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) border border-transparent hover:border-(--border-light)"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-(--gold) rounded-r-full" />
                )}
                <div className="flex items-center gap-2.5 min-w-0">
                  <MIcon
                    size={15}
                    className={`shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{label}</span>
                    <span className="text-[9px] text-(--text-muted)/60 truncate">{description}</span>
                  </div>
                </div>
                <FiChevronRight
                  size={11}
                  className={`shrink-0 transition-all duration-200 ${
                    isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}

        {/* ── CONFIG SECTION ── */}
        <div className="pt-4 pb-1">
          <p className="text-[9px] text-(--text-muted)/60 uppercase tracking-widest px-3 mb-2 font-semibold">Config</p>
          <NavLink
            to="/admin-dashboard/settings"
            title="Site Configuration"
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
