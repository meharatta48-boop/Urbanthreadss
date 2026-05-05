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
    <aside className="w-56 min-h-screen bg-[#080808] border-r border-[#111] flex flex-col flex-shrink-0">
      {/* LOGO */}
      <div className="px-5 py-5 border-b border-[#111]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            <div className={`absolute inset-0 gold-gradient flex items-center justify-center rounded-md transition-opacity duration-300${logoImg ? ' opacity-0' : ''}`}>
              <span className="text-black font-display font-bold text-sm">{brandName.charAt(0)}</span>
            </div>
            {logoImg && (
              <img src={logoImg} alt={brandName} className="w-full h-full object-contain relative z-10"
                onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-[11px] text-white tracking-wider truncate">{brandName}</div>
            <div className="text-[9px] text-[#333] uppercase tracking-widest">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] text-[#2a2a2a] uppercase tracking-widest px-3 mb-2">Menu</p>
        {menu.map(({ label, to, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[rgba(201,168,76,0.1)] text-[#c9a84c] border border-[#c9a84c]/20"
                  : "text-[#444] hover:text-white hover:bg-[#111] border border-transparent"
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Icon size={15} />
              <span className="text-sm">{label}</span>
            </div>
            <FiChevronRight size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}

        {/* DIVIDER */}
        <div className="pt-3 pb-1">
          <p className="text-[9px] text-[#2a2a2a] uppercase tracking-widest px-3 mb-2">Config</p>
          <NavLink
            to="/admin-dashboard/settings"
            className={({ isActive }) =>
              `flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[rgba(201,168,76,0.1)] text-[#c9a84c] border border-[#c9a84c]/20"
                  : "text-[#444] hover:text-white hover:bg-[#111] border border-transparent"
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
      <div className="px-3 py-4 border-t border-[#111] space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 gold-gradient rounded-md flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-[#333] text-[10px]">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-sm text-[#444] hover:text-red-400 hover:bg-red-900/10 transition-all"
        >
          <FiLogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}
