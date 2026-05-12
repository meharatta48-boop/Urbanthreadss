import { useMemo, useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiMenu, FiSettings, FiSearch, FiCommand, FiX } from "react-icons/fi";
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

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isEdit = pathname.includes("/edit");
  const title = isEdit ? "Edit Product" : (titleMap[pathname] || "Admin");
  const quickLinks = useMemo(() => [
    { label: "Dashboard", to: "/admin-dashboard", keywords: "home stats revenue" },
    { label: "Orders", to: "/admin-dashboard/orders", keywords: "orders shipping pending delivery" },
    { label: "Products", to: "/admin-dashboard/products", keywords: "products catalog stock" },
    { label: "Add Product", to: "/admin-dashboard/products/new", keywords: "new create product" },
    { label: "Categories", to: "/admin-dashboard/categories", keywords: "category" },
    { label: "Sub-Categories", to: "/admin-dashboard/subcategories", keywords: "subcategory" },
    { label: "Users", to: "/admin-dashboard/users", keywords: "customers users" },
    { label: "Site Settings", to: "/admin-dashboard/settings", keywords: "settings design seo popup" },
  ], []);

  const filteredQuickLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickLinks;
    return quickLinks.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(q));
  }, [query, quickLinks]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const isPalette = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isPalette) {
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

  const goTo = (to) => {
    navigate(to);
    setCommandOpen(false);
    setQuery("");
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-(--bg-deep) text-(--text-primary) overflow-hidden transition-colors duration-500" style={{ paddingTop: 0 }}>
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </div>

      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="h-15 bg-(--bg-surface) border-b border-(--border) flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-(--text-muted) hover:text-(--text-primary) p-1.5 rounded-lg border border-(--border) shrink-0"
            >
              <FiMenu size={17} />
            </button>
            <h1 className="font-display text-base sm:text-lg font-bold text-(--text-primary)">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 text-xs text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-colors border border-(--border) rounded-lg px-3 py-1.5 group"
              title="Quick command palette (Ctrl+K)"
            >
              <FiSearch size={12} className="transition-transform group-hover:scale-110" />
              <span>Quick Search</span>
              <span className="text-[10px] text-(--text-muted)/60 border border-(--border) rounded px-1 bg-(--bg-elevated)">Ctrl+K</span>
            </button>
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 text-xs text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30 transition-colors border border-(--border) rounded-lg px-3 py-1.5 group"
              title="View live website"
            >
              <span className="transition-transform group-hover:translate-x-0.5">View Site</span>
              <span className="text-(--gold)">→</span>
            </Link>
            <Link
              to="/admin-dashboard/settings"
              className={`p-2 rounded-lg border transition-all group ${
                pathname === "/admin-dashboard/settings" 
                  ? "border-(--gold)/30 text-(--gold) bg-(--gold)/5" 
                  : "border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30 hover:bg-(--gold)/5"
              }`}
              title="Site Settings"
            >
              <FiSettings size={15} className="transition-transform group-hover:rotate-90 duration-200" />
            </Link>
            <NotificationBell />
            <div className="flex items-center gap-2 border border-(--border) rounded-lg px-2 py-1.5 group hover:border-(--border-light) transition-colors">
              <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center text-black font-bold text-xs font-display transition-transform group-hover:scale-110">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="hidden md:block">
                <div className="text-(--text-primary) text-xs font-medium leading-none">{user?.name || "Admin"}</div>
                <div className="text-(--text-muted) text-[9px] mt-0.5">{user?.role || "Admin"}</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-(--bg-deep)">
          <Outlet />
        </main>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-10" onClick={() => setCommandOpen(false)}>
            <div
              className="max-w-2xl mx-auto rounded-2xl border border-(--border) bg-(--bg-card) overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-15 shrink-0 flex items-center justify-between px-6 border-b border-(--border) bg-(--bg-card)">
                <div className="flex items-center gap-2">
                  <FiCommand size={15} className="text-(--gold)" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search admin actions... (orders, settings, products)"
                    className="flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)"
                  />
                </div>
                <button 
                  onClick={() => setCommandOpen(false)} 
                  className="text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) p-1 rounded transition-colors"
                  title="Close (Escape)"
                >
                  <FiX size={15} />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {filteredQuickLinks.length > 0 ? (
                  filteredQuickLinks.map((item) => (
                    <button
                      key={item.to}
                      onClick={() => goTo(item.to)}
                      className="w-full text-left px-4 py-3 border-b border-(--border) hover:bg-(--bg-elevated) transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-(--text-primary) text-sm font-medium">{item.label}</p>
                          <p className="text-(--text-muted) text-xs">{item.to}</p>
                        </div>
                        <FiChevronRight size={12} className="text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-(--text-muted) text-sm">No matching command found.</p>
                    <p className="text-(--text-muted) text-xs mt-1">Try: orders, products, settings</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
