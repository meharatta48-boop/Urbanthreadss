import { FiSettings, FiSmartphone, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import NotificationBell from "./components/NotificationBell";

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

  const isEdit = pathname.includes("/edit");
  const title = isEdit ? "Edit Product" : titleMap[pathname] || "Admin Panel";

  return (
    <>
      <header className="h-15 bg-(--bg-surface) border-b border-(--border) flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shrink-0">
        <div>
          <h1 className="font-display text-base sm:text-lg font-bold text-(--text-primary) leading-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* MOBILE PREVIEW */}
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-(--text-muted) hover:text-(--gold) transition-colors border border-(--border) hover:border-(--gold)/20 rounded-lg px-3 py-1.5"
            title="Preview on mobile"
          >
            <FiSmartphone size={13} /> Mobile View
          </button>

          {/* QUICK NAV TO SITE */}
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-(--text-muted) hover:text-(--gold) transition-colors border border-(--border) hover:border-(--gold)/20 rounded-lg px-3 py-1.5"
          >
            View Site →
          </Link>

          {/* SETTINGS SHORTCUT */}
          <Link
            to="/admin-dashboard/settings"
            className={`p-2 rounded-lg border transition-colors ${
              pathname === "/admin-dashboard/settings"
                ? "border-(--gold)/30 text-(--gold) bg-(--gold)/5"
                : "border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/20"
            }`}
          >
            <FiSettings size={15} />
          </Link>

          {/* NOTIFICATIONS */}
          <NotificationBell />

          {/* AVATAR */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs font-display">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block">
              <div className="text-(--text-primary) text-xs font-medium leading-none">
                {user?.name || "Admin"}
              </div>
              <div className="text-(--text-muted) text-[10px] mt-0.5 capitalize">
                {user?.role || "admin"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE PREVIEW MODAL */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden max-w-md w-full flex flex-col shadow-2xl"
            style={{ height: "90vh", maxHeight: "800px" }}
          >
            {/* HEADER */}
            <div className="px-4 py-3 border-b border-(--border) flex items-center justify-between bg-(--bg-surface)">
              <div className="flex items-center gap-2 text-sm text-(--text-primary) font-medium">
                <FiSmartphone size={14} className="text-(--gold)" />
                Mobile Preview (375px)
              </div>
              <button
                onClick={() => setMobilePreviewOpen(false)}
                className="p-1.5 hover:bg-(--bg-elevated) rounded-lg transition-colors text-(--text-muted) hover:text-(--text-primary)"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* IFRAME CONTAINER */}
            <div className="flex-1 overflow-hidden bg-(--bg-deep)">
              <iframe
                src="/"
                style={{
                  width: "375px",
                  height: "100%",
                  border: "none",
                  transform: "scale(1)",
                  transformOrigin: "top left",
                }}
                title="Mobile Preview"
              />
            </div>

            {/* FOOTER */}
            <div className="px-4 py-3 border-t border-(--border) bg-(--bg-surface) text-(--text-muted) text-xs text-center">
              Viewing at 375px width · Changes update in real-time
            </div>
          </div>
        </div>
      )}
    </>
  );
}
