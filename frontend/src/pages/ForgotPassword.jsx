import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import api from "../services/api";

const STEPS = ["email", "password", "done"];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── Step 1: Verify email exists ── */
  const handleEmailStep = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Email daalna zaroori hai"); return; }
    setLoading(true);
    try {
      // Just check if email exists by trying a dummy hit — we validate on final step
      // For better UX, we always allow going to next step (security best practice)
      setStep("password");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Reset password ── */
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password kam se kam 6 characters ka hona chahiye"); return; }
    if (newPassword !== confirmPassword) { toast.error("Dono passwords match nahi kar rahe"); return; }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email, newPassword });
      if (res.data.success) {
        setStep("done");
      } else {
        toast.error(res.data.message || "Reset nahi ho saka");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Server error";
      toast.error(msg);
      if (msg.includes("not found") || msg.includes("User")) {
        setStep("email"); // go back if email is wrong
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = (pw) => {
    if (!pw) return { pct: 0, label: "", color: "#333" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { pct: 0, label: "", color: "#333" },
      { pct: 20, label: "Bohot kamzoor", color: "#f87171" },
      { pct: 40, label: "Kamzoor", color: "#fb923c" },
      { pct: 60, label: "Theek hai", color: "#facc15" },
      { pct: 80, label: "Acha", color: "#4ade80" },
      { pct: 100, label: "Bohot mazboot 💪", color: "#4ade80" },
    ];
    return levels[Math.min(score, 5)];
  };

  const pw = strength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 relative"
      style={{ background: "var(--bg-deep)" }}>
      {/* BG GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c9a84c]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* BACK TO LOGIN */}
        <Link
          to="/login"
          className="flex items-center gap-2 transition-colors text-sm mb-8 w-fit"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
          <FiArrowLeft size={15} /> Login pe wapis jao
        </Link>

        {/* PROGRESS BAR */}
        <div className="flex items-center gap-2 mb-8">
          {["Email", "New Password", "Done!"].map((s, i) => {
            const si = STEPS[i];
            const currentIdx = STEPS.indexOf(step);
            const done = currentIdx > i;
            const active = currentIdx === i;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done ? "gold-gradient text-black"
                  : active ? "border-2 border-[#c9a84c] text-[#c9a84c]"
                  : ""
                }`}
                style={!done && !active ? { border: "1px solid var(--border)", color: "var(--text-muted)" } : {}}>
                  {done ? <FiCheckCircle size={13} /> : i + 1}
                </div>
                <span className={`text-xs transition-colors ${active ? "" : done ? "text-[#c9a84c]" : ""}`}
                  style={active ? { color: "var(--text-primary)" } : done ? {} : { color: "var(--text-muted)" }}>{s}</span>
                {i < 2 && <div className="flex-1 h-px transition-colors" style={{ background: done ? "rgba(201,168,76,0.5)" : "var(--border)" }} />}
              </div>
            );
          })}
        </div>

        {/* CARD */}
        <div className="rounded-2xl p-7 sm:p-8 shadow-2xl"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: EMAIL ── */}
            {step === "email" && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-7 text-center">
                  <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                    <FiMail size={22} className="text-black" />
                  </div>
                  <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Password Reset</h1>
                  <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Apna registered email address daalo</p>
                </div>

                <form onSubmit={handleEmailStep} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: "var(--text-muted)" }} />
                      <input
                        type="email"
                        placeholder="apna@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="lux-input"
                        style={{ paddingLeft: "42px" }}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-gold w-full" style={{ width: "100%", padding: "14px" }}>
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <>Aage Baro <FiArrowRight size={14} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: NEW PASSWORD ── */}
            {step === "password" && (
              <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-7 text-center">
                  <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                    <FiLock size={22} className="text-black" />
                  </div>
                  <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Naya Password</h1>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    <span className="text-[#c9a84c]">{email}</span> ke liye
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                  {/* NEW PASSWORD */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Naya Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: "var(--text-muted)" }} />
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="lux-input"
                        style={{ paddingLeft: "42px", paddingRight: "42px" }}
                        required
                        minLength={6}
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                        {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    {/* STRENGTH INDICATOR */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                          <motion.div
                            animate={{ width: `${pw.pct}%` }}
                            className="h-full rounded-full transition-all"
                            style={{ background: pw.color }}
                          />
                        </div>
                        <p className="text-xs" style={{ color: pw.color }}>{pw.label}</p>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Password Confirm Karo</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: "var(--text-muted)" }} />
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="Same password dobara likhein"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`lux-input ${confirmPassword && confirmPassword !== newPassword ? "border-red-500/50" : confirmPassword && confirmPassword === newPassword ? "border-green-500/50" : ""}`}
                        style={{ paddingLeft: "42px" }}
                        required
                      />
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords match nahi kar rahe ❌</p>
                    )}
                    {confirmPassword && confirmPassword === newPassword && (
                      <p className="text-green-400 text-xs mt-1">Passwords match ✓</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep("email")}
                      className="btn-outline flex-1" style={{ padding: "14px" }}>
                      ← Wapis
                    </button>
                    <button type="submit" disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                      className="btn-gold flex-1 disabled:opacity-40" style={{ padding: "14px" }}>
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : "Password Reset Karo"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: DONE ── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-5"
                >
                  <FiCheckCircle size={36} className="text-black" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Password Reset Ho Gaya!</h2>
                <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                  Aapka password successfully reset ho gaya hai. Ab naye password se login karo.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-gold"
                  style={{ padding: "14px 32px" }}
                >
                  Login Page Pe Jao <FiArrowRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Account hai? <Link to="/login" className="text-[#c9a84c] hover:underline">Login karo</Link>
          {" · "}
          Account nahi? <Link to="/signup" className="text-[#c9a84c] hover:underline">Register karo</Link>
        </p>
      </div>
    </div>
  );
}
