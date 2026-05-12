import { useMemo, useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  FiMenu, FiSettings, FiSearch, FiCommand, FiX,
  FiChevronRight, FiBell
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
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

const iconMap = {
  "/admin-dashboard": "🏠",
  "/admin-dashboard/orders": "📦",
  "/admin-dashboard/products": "🛍️",
  "/admin-dashboard/products/new": "➕",
  "/admin-dashboard/categories": "🗂️",
  "/admin-dashboard/subcategories": "🏷️",
  "/admin-dashboard/users": "👥",
  "/admin-dashboard/settings": "⚙️",
};

const quickLinks = [
  { label: "Dashboard",      to: "/admin-dashboard",               keywords: "home stats revenue overview" },
  { label: "Orders",         to: "/admin-dashboard/orders",        keywords: "orders shipping pending delivery" },
  { label: "Products",       to: "/admin-dashboard/products",      keywords: "products catalog stock list" },
  { label: "Add Product",    to: "/admin-dashboard/products/new",  keywords: "new create product add" },
  { label: "Categories",     to: "/admin-dashboard/categories",    keywords: "category season collection" },
  { label: "Sub-Categories", to: "/admin-dashboard/subcategories", keywords: "subcategory men women kids" },
  { label: "Users",          to: "/admin-dashboard/users",         keywords: "customers users accounts" },
  { label: "Site Settings",  to: "/admin-dashboard/settings",      keywords: "settings design seo popup config" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isEdit = pathname.includes("/edit");
  const title = isEdit ? "Edit Product" : (titleMap[pathname] || "Admin");
  const pageIcon = isEdit ? "✏️" : (iconMap[pathname] || "⚙️");

  /* ── Keyboard shortcut ── */
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!commandOpen) setQuery("");
  }, [commandOpen]);

  /* ── Close sidebar on route change ── */
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickLinks;
    return quickLinks.filter((item) =>
      `${item.label} ${item.keywords}`.toLowerCase().includes(q)
    );
  }, [query]);

  const goTo = (to) => {
    navigate(to);
    setCommandOpen(false);
    setQuery("");
    setSidebarOpen(false);
  };

  return (
    <div
      className="flex h-screen bg-(--bg-deep) text-(--text-primary) overflow-hidden transition-colors duration-500"
      style={{ paddingTop: 0 }}
    >
      {/* ── MOBILE BACKDROP ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* ── MAIN COLUMN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── TOPBAR ── */}
        <header className="h-[56px] bg-(--bg-surface) border-b border-(--border) flex items-center justify-between px-4 sm:px-5 shrink-0 transition-colors gap-3">

          {/* LEFT: Hamburger + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-all active:scale-95"
              aria-label="Open sidebar"
            >
              <FiMenu size={16} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm hidden sm:inline">{pageIcon}</span>
              <h1 className="font-display text-sm sm:text-base font-bold text-(--text-primary) truncate">
                {title}
              </h1>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Search / Command Palette */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 text-xs text-(--text-muted) hover:text-(--text-primary) transition-all border border-(--border) hover:border-(--border-light) rounded-xl px-3 py-1.5 group bg-(--bg-elevated) hover:bg-(--bg-card)"
              title="Quick Search (Ctrl+K)"
            >
              <FiSearch size={12} className="transition-transform group-hover:scale-110" />
              <span className="hidden md:inline">Quick Search</span>
              <span className="hidden lg:inline text-[10px] text-(--text-muted)/50 border border-(--border) rounded-md px-1 py-0.5 bg-(--bg-surface)">
                Ctrl+K
              </span>
            </button>

            {/* Mobile search icon only */}
            <button
              onClick={() => setCommandOpen(true)}
              className="sm:hidden p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--text-primary) transition-all"
              title="Search"
            >
              <FiSearch size={15} />
            </button>

            {/* View Site */}
            <Link
              to="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30 transition-all border border-(--border) rounded-xl px-3 py-1.5 group"
              title="View live website"
            >
              <span>View Site</span>
              <span className="text-(--gold) transition-transform group-hover:translate-x-0.5">→</span>
            </Link>

            {/* Settings */}
            <Link
              to="/admin-dashboard/settings"
              className={`p-2 rounded-xl border transition-all group ${
                pathname === "/admin-dashboard/settings"
                  ? "border-(--gold)/30 text-(--gold) bg-(--gold)/5"
                  : "border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30 hover:bg-(--gold)/5"
              }`}
              title="Site Settings"
            >
              <FiSettings size={15} className="transition-transform group-hover:rotate-90 duration-300" />
            </Link>

            {/* Notifications */}
            <NotificationBell />

            {/* User Avatar */}
            <div className="flex items-center gap-2 border border-(--border) rounded-xl px-2 py-1.5 group hover:border-(--border-light) transition-all cursor-default">
              <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs font-display shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="hidden md:block pr-1">
                <div className="text-(--text-primary) text-xs font-semibold leading-none">
                  {user?.name || "Admin"}
                </div>
                <div className="text-(--text-muted) text-[9px] mt-0.5 capitalize">
                  {user?.role || "admin"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-(--bg-deep)">
          <Outlet />
        </main>
      </div>

      {/* ── COMMAND PALETTE ── */}
      {commandOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
          onClick={() => setCommandOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-(--border) bg-(--bg-card) overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border)">
              <FiCommand size={15} className="text-(--gold) shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages — orders, products, settings..."
                className="flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)"
              />
              <button
                onClick={() => setCommandOpen(false)}
                className="text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) p-1.5 rounded-lg transition-all"
                title="Close (Esc)"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {filtered.length > 0 ? (
                <>
                  <p className="text-[9px] text-(--text-muted)/60 uppercase tracking-widest px-4 pt-3 pb-1 font-semibold">
                    Pages
                  </p>
                  {filtered.map((item) => (
                    <button
                      key={item.to}
                      onClick={() => goTo(item.to)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between transition-all group ${
                        pathname === item.to
                          ? "bg-(--gold)/5 border-l-2 border-(--gold)"
                          : "hover:bg-(--bg-elevated) border-l-2 border-transparent"
                      }`}
                    >
                      <div>
                        <p className="text-(--text-primary) text-sm font-medium">{item.label}</p>
                        <p className="text-(--text-muted) text-xs mt-0.5">{item.to}</p>
                      </div>
                      <FiChevronRight
                        size={13}
                        className="text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-(--text-muted) text-sm">No page found for "{query}"</p>
                  <p className="text-(--text-muted)/60 text-xs mt-1">Try: orders, products, settings</p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-(--border) flex items-center gap-3 text-(--text-muted)/50 text-[10px]">
              <span><kbd className="bg-(--bg-elevated) border border-(--border) rounded px-1 py-0.5 text-[9px]">↑↓</kbd> navigate</span>
              <span><kbd className="bg-(--bg-elevated) border border-(--border) rounded px-1 py-0.5 text-[9px]">Enter</kbd> go</span>
              <span><kbd className="bg-(--bg-elevated) border border-(--border) rounded px-1 py-0.5 text-[9px]">Esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
