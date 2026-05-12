import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { toast } from "react-toastify";

const API_BASE = SERVER_URL;

export default function Login() {
  const { login } = useAuth();
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";
  const logoImg = settings?.logoImage ? getImageUrl(settings.logoImage) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for expired session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired") === "true") {
      toast.info("Session expired. Please sign in again.");
      // Remove the query param from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await login(form);
    setLoading(false);
    if (data) {
      navigate(data.user.role === "admin" ? "/admin-dashboard" : "/shop");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center px-4 pt-24 pb-16"
      style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="w-full max-w-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        >
          {/* HEADER */}
          <div className="text-center mb-10 overflow-hidden">
            <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-5 overflow-hidden relative">
              <div className={`absolute inset-0 gold-gradient flex items-center justify-center rounded-xl transition-opacity duration-300${logoImg ? ' opacity-0' : ''}`}>
                <span className="text-black font-display font-bold text-2xl">{brandName.charAt(0)}</span>
              </div>
              {logoImg && (
                <img src={logoImg} alt={brandName} className="w-full h-full object-contain relative z-10"
                  onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
              )}
            </div>
            <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Welcome Back
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Sign in to your {brandName} account
            </p>
          </div>

          {/* CARD */}
          <div className="rounded-2xl p-6 sm:p-8 shadow-2xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="text-xs uppercase tracking-wider block mb-2"
                  style={{ color: "var(--text-muted)" }}>Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                    style={{ color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    placeholder="aapka@email.com"
                    className="lux-input"
                    style={{ paddingLeft: "42px" }}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-xs uppercase tracking-wider block mb-2"
                  style={{ color: "var(--text-muted)" }}>Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                    style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="lux-input"
                    style={{ paddingLeft: "42px", paddingRight: "42px" }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full mt-2" style={{ width: "100%" }}>
                {loading ? "Signing in..." : <>Sign In <FiArrowRight /></>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Account nahi hai?{" "}
                <Link to="/signup" className="font-medium hover:underline" style={{ color: "var(--gold)" }}>
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
