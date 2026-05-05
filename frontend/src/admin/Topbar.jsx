import { FiBell, FiSearch, FiSettings, FiSmartphone } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

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
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Check for edit route
  const isEdit = pathname.includes("/edit");
  const title = isEdit ? "Edit Product" : titleMap[pathname] || "Admin Panel";

  return (
    <>
      <header className="h-[60px] bg-[#080808] border-b border-[#111] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 flex-shrink-0">
        <div>
          <h1 className="font-display text-base sm:text-lg font-bold text-white leading-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* MOBILE PREVIEW */}
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#444] hover:text-[#c9a84c] transition-colors border border-[#111] rounded-lg px-3 py-1.5"
            title="Preview on mobile"
          >
            <FiSmartphone size={13} /> Mobile View
          </button>

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

      {/* MOBILE PREVIEW MODAL */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden max-w-md w-full flex flex-col" style={{ height: "90vh", maxHeight: "800px" }}>
            {/* HEADER */}
            <div className="px-4 py-3 border-b border-[#111] flex items-center justify-between bg-[#080808]">
              <div className="flex items-center gap-2 text-sm text-white font-medium">
                <FiSmartphone size={14} /> Mobile Preview (375px)
              </div>
              <button
                onClick={() => setMobilePreviewOpen(false)}
                className="p-1 hover:bg-[#111] rounded-lg transition-colors text-[#444] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* IFRAME CONTAINER */}
            <div className="flex-1 overflow-hidden bg-black">
              <iframe
                src="/"
                style={{ width: "100%", height: "100%", border: "none", backgroundColor: "white" }}
                title="Mobile Preview"
              />
            </div>

            {/* FOOTER */}
            <div className="px-4 py-3 border-t border-[#111] bg-[#080808] text-[#444] text-xs text-center">
              Viewing at mobile width • Changes update in real-time
            </div>
          </div>
        </div>
      )}
    </>
  );
}
