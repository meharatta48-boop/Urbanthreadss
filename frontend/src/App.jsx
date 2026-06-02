import {
  BrowserRouter, Routes, Route, Navigate, useLocation, useParams,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
// SpeedInsights will be imported in production only
import "react-toastify/dist/ReactToastify.css";
import { Suspense, lazy, useEffect } from "react";

// Wrapper to catch chunk load errors and force a refresh to get the new chunks
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem("page-has-been-force-refreshed") || "false"
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem("page-has-been-force-refreshed", "false");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem("page-has-been-force-refreshed", "true");
        window.location.reload();
      }
      throw error;
    }
  });
import LoadingSpinner from "./components/LoadingSpinner";
import { useAuth } from "./context/AuthContext";
// import { useTheme } from "./context/ThemeContext";
// import { SpeedInsights } from "@vercel/speed-insights/react";
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
import ErrorBoundary from "./components/ErrorBoundary";

/* LAZY PAGES */
const Home = lazyWithRetry(() => import("./pages/Home"));
const AboutUs = lazyWithRetry(() => import("./pages/AboutUs"));
const Shop = lazyWithRetry(() => import("./pages/Shop"));
const ProductDetail = lazyWithRetry(() => import("./pages/ProductDetail"));
const Cart = lazyWithRetry(() => import("./pages/Cart"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const Signup = lazyWithRetry(() => import("./pages/Signup"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const SupportChat = lazyWithRetry(() => import("./pages/SupportChat"));
const CustomPage = lazyWithRetry(() => import("./pages/CustomPage"));
const PolicyPage = lazyWithRetry(() => import("./pages/PolicyPage"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const MyOrders = lazyWithRetry(() => import("./pages/MyOrders"));
const OrderSuccess = lazyWithRetry(() => import("./pages/OrderSuccess"));

/* ADMIN */
const AdminLayout = lazyWithRetry(() => import("./admin/AdminLayout"));
const Dashboard = lazyWithRetry(() => import("./admin/AdminDashboard"));
const ProductList = lazyWithRetry(() => import("./admin/products/ProductList"));
const ProductForm = lazyWithRetry(() => import("./admin/products/ProductForm"));
const ComboList = lazyWithRetry(() => import("./admin/combos/ComboList"));
const ComboForm = lazyWithRetry(() => import("./admin/combos/ComboForm"));
const CategoryList = lazyWithRetry(() => import("./admin/category/CategoryList"));
const SubCategoryList = lazyWithRetry(() => import("./admin/subcategory/SubCategoryList"));
const Users = lazyWithRetry(() => import("./admin/user/User"));
const OrderList = lazyWithRetry(() => import("./admin/orders/OrderList"));
const SiteSettingsPage = lazyWithRetry(() => import("./admin/settings/SiteSettings"));
const Analytics = lazyWithRetry(() => import("./admin/analytics/Analytics"));

import { registerImageCache } from "./utils/imageCache";
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

function SocialPreviewRedirect() {
  const { id } = useParams();
  return <Navigate to={`/product/${id}`} replace />;
}

/* LAYOUT WRAPPER */
function Layout({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin-dashboard");
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname.replace(/\/$/, ""));

  return (
    <>
      <ThemeInjector />

      {!isAdmin && !isAuthPage && (
        <header className="sticky top-0 z-50 w-full bg-(--bg-deep)">
          <CouponBanner />
          <Navbar />
        </header>
      )}

      <main className="min-h-[80vh]">
        {children}
      </main>

      {!isAdmin && !isAuthPage && (
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
  // const { theme } = useTheme();
  const { settings, loading: settingsLoading } = useSettings();

  // const isDark = theme === "dark";

  useEffect(() => {
    registerImageCache();
    // preloadCriticalImages(["/logo.png"]); // Disabled to prevent unused preload warning
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
      {/* <SpeedInsights /> */}

      <ToastContainer
        theme="dark"
        position="top-right"
      />

      <ScrollToTop />
      <PromotionalPopup />

      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner size="lg" message="Loading..." />}>
            <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/api/seo/social-preview/product/:id" element={<SocialPreviewRedirect />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/support" element={<SupportChat />} />
            <Route path="/page/:slug" element={<CustomPage />} />
            <Route path="/privacy" element={<PolicyPage type="privacy" />} />
            <Route path="/terms" element={<PolicyPage type="terms" />} />
            <Route path="/returns" element={<PolicyPage type="returns" />} />
            <Route path="/shipping" element={<PolicyPage type="shipping" />} />

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
              <Route path="combos" element={<ComboList />} />
              <Route path="combos/new" element={<ComboForm />} />
              <Route path="combos/:id/edit" element={<ComboForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="subcategories" element={<SubCategoryList />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<SiteSettingsPage />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </Layout>
    </BrowserRouter>
  );
}