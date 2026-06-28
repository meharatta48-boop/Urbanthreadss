import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
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

  // "email" ya "phone" mode
  const [loginMode, setLoginMode] = useState("email");
  const [form, setForm] = useState({ email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for expired session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired") === "true") {
      toast.info("Session expired. Please sign in again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Sirf active mode ka field bhejo
    const payload = {
      password: form.password,
      ...(loginMode === "email" ? { email: form.email } : { phone: form.phone }),
    };
    const data = await login(payload);
    setLoading(false);
    if (data) {
      navigate(data.user.role === "admin" ? "/admin-dashboard" : "/shop");
    }
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setForm((f) => ({ ...f, email: "", phone: "" }));
  };

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center px-4 pt-24 pb-16"
      style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="w-full max-w-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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

            {/* MODE TOGGLE */}
            <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: "1px solid var(--border)", background: "var(--bg-deep)" }}>
              <button
                type="button"
                onClick={() => switchMode("email")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-300"
                style={{
                  background: loginMode === "email" ? "var(--gold)" : "transparent",
                  color: loginMode === "email" ? "#000" : "var(--text-muted)",
                  borderRadius: "10px 0 0 10px",
                }}
              >
                <FiMail size={15} />
                Email
              </button>
              <button
                type="button"
                onClick={() => switchMode("phone")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-300"
                style={{
                  background: loginMode === "phone" ? "var(--gold)" : "transparent",
                  color: loginMode === "phone" ? "#000" : "var(--text-muted)",
                  borderRadius: "0 10px 10px 0",
                }}
              >
                <FiPhone size={15} />
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL or PHONE */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={loginMode}
                  initial={{ opacity: 0, x: loginMode === "email" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: loginMode === "email" ? 20 : -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {loginMode === "email" ? (
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
                  ) : (
                    <div>
                      <label className="text-xs uppercase tracking-wider block mb-2"
                        style={{ color: "var(--text-muted)" }}>Phone Number</label>
                      <div className="relative">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                          style={{ color: "var(--text-muted)" }} />
                        <input
                          type="tel"
                          placeholder="03xx-xxxxxxx"
                          className="lux-input"
                          style={{ paddingLeft: "42px" }}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

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
                {loading ? "Signing in..." : <> Sign In <FiArrowRight /></>}
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
