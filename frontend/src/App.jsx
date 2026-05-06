import {
  BrowserRouter, Routes, Route, Navigate, useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* LAYOUT */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CouponBanner from "./components/home/CouponBanner";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ScrollToTop from "./components/home/ScrollToTop";
import ThemeInjector from "./components/ThemeInjector";
import MaintenanceMode from "./components/home/MaintenanceMode";
import LaunchTimer from "./components/home/LaunchTimer";
import PromotionalPopup from "./components/home/PromotionalPopup";
import SeoManager from "./components/SeoManager";
import { useSettings } from "./context/SettingsContext";

/* PAGES */
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import SupportChat from "./pages/SupportChat";
import CustomPage from "./pages/CustomPage";
import NotFound from "./pages/NotFound";
import MyOrders from "./pages/MyOrders";
import OrderSuccess from "./pages/OrderSuccess";

/* ADMIN */
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/AdminDashboard";
import ProductList from "./admin/products/ProductList";
import ProductForm from "./admin/products/ProductForm";
import CategoryList from "./admin/category/CategoryList";
import SubCategoryList from "./admin/subcategory/SubCategoryList";
import Users from "./admin/user/User";
import OrderList from "./admin/orders/OrderList";
import SiteSettingsPage from "./admin/settings/SiteSettings";

/* CONTEXT */
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { toast } from "react-toastify";

/* ─── ADMIN ONLY GUARD ─── */
function AdminRoute({ children }) {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token) {
    toast.info("Admin login required");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

/* ─── LAYOUT WRAPPER ─── */
function Layout({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin-dashboard");

  return (
    <>
      <ThemeInjector />
      {!isAdmin && (
        <>
          {/* Gold coupon banner above navbar */}
          <CouponBanner />
          <Navbar />
        </>
      )}

      {/* Page content */}
      <main className={`min-h-[80vh] ${!isAdmin ? "" : ""}`}>
        {children}
      </main>

      {!isAdmin && (
        <>
          <Footer />
          {/* WhatsApp floating button — shown on all user pages */}
          <WhatsAppFloat />
        </>
      )}
    </>
  );
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { settings, loading: settingsLoading } = useSettings();
  const isDark = theme === "dark";
  
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-deep)">
        <div className="flex flex-col items-center gap-4 fade-up">
          <div className="w-12 h-12 border-4 border-(--gold) border-t-transparent rounded-full animate-spin"></div>
          <p className="font-display text-xl text-(--gold) tracking-widest uppercase">Urban Thread</p>
          <p className="text-sm text-(--text-muted) animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Maintenance Check
  const isAuthPath = window.location.pathname === "/login" || window.location.pathname === "/signup";
  const isAdminPath = window.location.pathname.startsWith("/admin");
  const isMaintenance = settings?.maintenanceMode && (!user || user.role !== "admin") && !isAdminPath && !isAuthPath;
  const isComingSoon = settings?.isComingSoon && (!user || user.role !== "admin") && !isAdminPath && !isAuthPath;

  if (isMaintenance) {
    return <MaintenanceMode />;
  }

  if (isComingSoon) {
    return <LaunchTimer launchDate={settings?.launchDate} />;
  }

  return (
    <BrowserRouter>
      <SeoManager />
      <ToastContainer
        theme={isDark ? "dark" : "light"}
        toastStyle={
          isDark
            ? { background: "#0c0c0c", border: "1px solid #1a1a1a", color: "#f5f0e8" }
            : { background: "#ffffff", border: "1px solid #e2ddd4", color: "#1a1410" }
        }
        progressStyle={{ background: "#c9a84c" }}
        position="top-right"
      />
      <ScrollToTop />
      <PromotionalPopup />
      <Layout>
        <Routes>
          {/* ═══ PUBLIC PAGES ═══ */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/support" element={<SupportChat />} />
          <Route path="/page/:slug" element={<CustomPage />} />

          {/* ═══ AUTH ═══ */}
          <Route
            path="/login"
            element={user ? <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/"} /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <Signup />}
          />

          {/* ═══ ADMIN ONLY ═══ */}
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route
            path="/admin-dashboard"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="subcategories" element={<SubCategoryList />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<SiteSettingsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
