import { FiBell, FiSearch, FiSettings } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const titleMap = {
  "/admin-dashboard": "Dashboard",
  "/admin-dashboard/orders": "Orders",
  "/admin-dashboard/products": "Products",
  "/admin-dashboard/products/new": "Add Product",
  "/admin-dashboard/categories": "Categories",
  "/admin-dashboard/subcategories": "Sub-Categories",
  "/admin-dashboard/users": "Users",
  "/admin-dashboard/settings": "Site Settings",
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Check for edit route
  const isEdit = pathname.includes("/edit");
  const title = isEdit ? "Edit Product" : titleMap[pathname] || "Admin Panel";

  return (
    <header className="h-[60px] bg-[#080808] border-b border-[#111] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 flex-shrink-0">
      <div>
        <h1 className="font-display text-base sm:text-lg font-bold text-white leading-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* QUICK NAV TO SITE */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-[#444] hover:text-[#c9a84c] transition-colors border border-[#111] rounded-lg px-3 py-1.5"
        >
          View Site →
        </Link>

        {/* SETTINGS SHORTCUT */}
        <Link
          to="/admin-dashboard/settings"
          className={`p-2 rounded-lg border transition-colors ${
            pathname === "/admin-dashboard/settings"
              ? "border-[#c9a84c]/30 text-[#c9a84c]"
              : "border-[#111] text-[#444] hover:text-[#c9a84c]"
          }`}
        >
          <FiSettings size={15} />
        </Link>

        {/* NOTIFICATIONS */}
        <button className="relative p-2 rounded-lg border border-[#111] text-[#444] hover:text-[#c9a84c] hover:border-[#c9a84c]/30 transition-colors">
          <FiBell size={15} />
          <span
            className="absolute -top-1 -right-1 text-[9px] font-bold text-black gold-gradient rounded-full flex items-center justify-center"
            style={{ width: 15, height: 15 }}
          >3</span>
        </button>

        {/* AVATAR */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs font-display">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <div className="text-white text-xs font-medium leading-none">{user?.name || "Admin"}</div>
            <div className="text-[#444] text-[10px] mt-0.5 capitalize">{user?.role || "admin"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
