import {
  BrowserRouter, Routes, Route, Navigate, useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "react-toastify/dist/ReactToastify.css";
import { Suspense, lazy, useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useSettings } from "./context/SettingsContext";

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

/* LAZY PAGES */
const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SupportChat = lazy(() => import("./pages/SupportChat"));
const CustomPage = lazy(() => import("./pages/CustomPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));

/* ADMIN */
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Dashboard = lazy(() => import("./admin/AdminDashboard"));
const ProductList = lazy(() => import("./admin/products/ProductList"));
const ProductForm = lazy(() => import("./admin/products/ProductForm"));
const CategoryList = lazy(() => import("./admin/category/CategoryList"));
const SubCategoryList = lazy(() => import("./admin/subcategory/SubCategoryList"));
const Users = lazy(() => import("./admin/user/User"));
const OrderList = lazy(() => import("./admin/orders/OrderList"));
const SiteSettingsPage = lazy(() => import("./admin/settings/SiteSettings"));

import { registerImageCache, preloadCriticalImages } from "./utils/imageCache";
import { keepAliveManager } from "./utils/keepAlive";
import { metaTracker } from "./utils/metaTracking";

/* ADMIN GUARD */
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

/* LAYOUT WRAPPER */
function Layout({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin-dashboard");

  return (
    <>
      <ThemeInjector />

      {!isAdmin && (
        <header className="sticky top-0 z-50 w-full bg-(--bg-deep)">
          <CouponBanner />
          <Navbar />
        </header>
      )}

      <main className="min-h-[80vh]">
        {children}
      </main>

      {!isAdmin && (
        <>
          <Footer />
          <WhatsAppFloat />
        </>
      )}
    </>
  );
}

/* ROUTE TRACKER */
function RouteObservers() {
  const location = useLocation();

  useEffect(() => {
    metaTracker.trackPageView();
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { settings, loading: settingsLoading } = useSettings();

  const isDark = theme === "dark";

  useEffect(() => {
    registerImageCache();
    preloadCriticalImages(["/logo.png"]);
    keepAliveManager.start();
    metaTracker.init();
  }, []);

  useEffect(() => {
    const prefetch = () => {
      import("./pages/Shop");
      import("./pages/ProductDetail");
      import("./pages/Checkout");
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetch, { timeout: 1200 });
    } else {
      setTimeout(prefetch, 800);
    }
  }, []);

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-deep)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--gold) border-t-transparent rounded-full animate-spin" />
          <p className="text-(--gold)">Loading...</p>
        </div>
      </div>
    );
  }

  /* ✅ SAFE PATH LOGIC (NO useLocation crash) */
  const path = window.location.pathname;

  const isAuthPath = path === "/login" || path === "/signup";
  const isAdminPath = path.startsWith("/admin");

  const isMaintenance =
    settings?.maintenanceMode &&
    (!user || user.role !== "admin") &&
    !isAdminPath &&
    !isAuthPath;

  const isComingSoon =
    settings?.isComingSoon &&
    (!user || user.role !== "admin") &&
    !isAdminPath &&
    !isAuthPath;

  if (isMaintenance) return <MaintenanceMode />;
  if (isComingSoon) return <LaunchTimer launchDate={settings?.launchDate} />;

  return (
    <BrowserRouter>
      <RouteObservers />
      <SeoManager />
      <SpeedInsights />

      <ToastContainer
        theme="dark"
        position="top-right"
      />

      <ScrollToTop />
      <PromotionalPopup />

      <Layout>
        <Suspense fallback={<LoadingSpinner size="lg" message="Loading..." />}>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/support" element={<SupportChat />} />
            <Route path="/page/:slug" element={<CustomPage />} />

            {/* AUTH */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/"} />
                ) : (
                  <Login />
                )
              }
            />

            <Route
              path="/signup"
              element={user ? <Navigate to="/" /> : <Signup />}
            />

            {/* ADMIN */}
            <Route path="/admin" element={<Navigate to="/admin-dashboard" />} />

            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
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
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}