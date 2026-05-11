import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers,
  FiLayers, FiTag, FiLogOut, FiChevronRight, FiSettings
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
const API_BASE = SERVER_URL;

const menu = [
  { label: "Dashboard", to: "/admin-dashboard", Icon: FiGrid, end: true },
  { label: "Orders", to: "/admin-dashboard/orders", Icon: FiShoppingBag },
  { label: "Products", to: "/admin-dashboard/products", Icon: FiPackage },
  { label: "Categories", to: "/admin-dashboard/categories", Icon: FiLayers },
  { label: "Sub-Categories", to: "/admin-dashboard/subcategories", Icon: FiTag },
  { label: "Users", to: "/admin-dashboard/users", Icon: FiUsers },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const brandName = settings?.brandName || "URBAN THREAD";
  const logoImg = settings?.logoImage ? getImageUrl(settings.logoImage) : null;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className="w-56 min-h-screen bg-(--bg-surface) border-r border-(--border) flex flex-col shrink-0 transition-colors">
      {/* LOGO */}
      <div className="px-5 py-5 border-b border-(--border)">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden relative">
            <div className={`absolute inset-0 gold-gradient flex items-center justify-center rounded-md transition-opacity duration-300${logoImg ? ' opacity-0' : ''}`}>
              <span className="text-black font-display font-bold text-sm">{brandName.charAt(0)}</span>
            </div>
            {logoImg && (
              <img src={logoImg} alt={brandName} className="w-full h-full object-contain relative z-10"
                onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-[11px] text-(--text-primary) tracking-wider truncate">{brandName}</div>
            <div className="text-[9px] text-(--text-muted) uppercase tracking-widest">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] text-(--text-muted)/60 uppercase tracking-widest px-3 mb-2">Menu</p>
        {menu.map(({ label, to, Icon: MIcon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-(--gold)/10 text-(--gold) border border-(--gold)/20"
                  : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) border border-transparent"
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <MIcon size={15} />
              <span className="text-sm">{label}</span>
            </div>
            <FiChevronRight size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}

        {/* DIVIDER */}
        <div className="pt-3 pb-1">
          <p className="text-[9px] text-(--text-muted)/60 uppercase tracking-widest px-3 mb-2">Config</p>
          <NavLink
            to="/admin-dashboard/settings"
            className={({ isActive }) =>
              `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-(--gold)/10 text-(--gold) border border-(--gold)/20"
                  : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) border border-transparent"
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <FiSettings size={15} /> Site Settings
            </div>
          </NavLink>
        </div>
      </nav>

      {/* USER + LOGOUT */}
      <div className="px-3 py-4 border-t border-(--border) space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 gold-gradient rounded-md flex items-center justify-center text-black font-bold text-xs shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-(--text-primary) text-xs font-medium truncate">{user?.name}</p>
            <p className="text-(--text-muted) text-[10px]">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-sm text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <FiLogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}
