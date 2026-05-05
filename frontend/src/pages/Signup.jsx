import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";

const API_BASE = SERVER_URL;

export default function Signup() {
  const { signup } = useAuth();
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";
  const logoImg = settings?.logoImage ? getImageUrl(settings.logoImage) : null;
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await signup(form);
    setLoading(false);
    if (success) navigate("/shop");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16"
      style={{ background: "var(--bg-deep)" }}>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        >
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-5 overflow-hidden relative">
              <div className={`absolute inset-0 gold-gradient flex items-center justify-center rounded-xl transition-opacity duration-300${logoImg ? ' opacity-0' : ''}`}>
                <span className="text-black font-display font-bold text-2xl">{brandName.charAt(0)}</span>
              </div>
              {logoImg && (
                <img src={logoImg} alt={brandName} className="w-full h-full object-contain relative z-10"
                  onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
              )}
            </div>
            <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Create Account</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{brandName} family mein khush aamdeed!</p>
          </div>

          <div className="rounded-2xl p-8 shadow-2xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: "Full Name", key: "name", type: "text", Icon: FiUser, placeholder: "Aapka pura naam" },
                { label: "Email Address", key: "email", type: "email", Icon: FiMail, placeholder: "aapka@email.com" },
              ].map(({ label, key, type, Icon, placeholder }) => (
                <div key={key}>
                  <label className="text-xs uppercase tracking-wider block mb-2"
                    style={{ color: "var(--text-muted)" }}>{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                      style={{ color: "var(--text-muted)" }} />
                    <input
                      type={type}
                      placeholder={placeholder}
                      className="lux-input"
                      style={{ paddingLeft: "42px" }}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs uppercase tracking-wider block mb-2"
                  style={{ color: "var(--text-muted)" }}>Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                    style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    className="lux-input"
                    style={{ paddingLeft: "42px", paddingRight: "42px" }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
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

              <button type="submit" disabled={loading} className="btn-gold w-full mt-2" style={{ width: "100%" }}>
                {loading ? "Creating Account..." : <>Create Account <FiArrowRight /></>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Account hai?{" "}
                <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--gold)" }}>
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
