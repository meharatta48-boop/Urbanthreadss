import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiStar, FiChevronLeft, FiChevronRight,
  FiMessageSquare, FiX, FiCheck, FiEdit3, FiLock
} from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../services/api";

/* ── Default reviews ── */
const DEFAULT_REVIEWS = [
  { _id: "d1", name: "Ahmad Raza",     city: "Lahore",     rating: 5, comment: "Bohot acha quality hai. Maine shirt order ki thi, kapra bilkul premium quality ka tha. Delivery bhi 2 din mein aa gayi. Definitely recommend karunga!" },
  { _id: "d2", name: "Sana Malik",     city: "Karachi",    rating: 5, comment: "Pehli baar order kiya tha thoda dar tha but bohot khush hua. T-shirt ki quality amazing hai. Size bhi bilkul fit tha. Zindabad! 🙌" },
  { _id: "d3", name: "Bilal Khan",     city: "Islamabad",  rating: 4, comment: "Overall experience acha tha. Product quality meri expectations se zyada achi nikli. Agle baar bhi zaroor order karunga insha Allah." },
  { _id: "d4", name: "Fatima Hussain", city: "Faisalabad", rating: 5, comment: "Mujhe gift karni thi bhai ko, unhone bohot pasand kiya. Packaging bhi premium thi. WhatsApp pe bhi jaldi reply mila. 10/10 experience!" },
  { _id: "d5", name: "Usman Tariq",    city: "Multan",     rating: 5, comment: "Price ke hisab se quality acha hai. Market mein itni quality itne daam mein nahi milti. Follow karta rahunga!" },
  { _id: "d6", name: "Zara Ahmed",     city: "Rawalpindi", rating: 4, comment: "Delivery thodi late hui but product mein koi complaint nahi. Kapra soft hai aur rang fade nahi kiya wash ke baad bhi. Satisfied hun!" },
];

const COLORS = ["#c9a84c", "#4ade80", "#60a5fa", "#c084fc", "#f59e0b", "#f87171", "#34d399", "#fb923c"];
const AvatarCircle = ({ name, size = 44 }) => {
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div className="rounded-full flex items-center justify-center font-display font-bold text-black flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const StarRow = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <FiStar key={s} size={size}
        style={{ color: s <= rating ? "#c9a84c" : "var(--border-light)",
                 fill:  s <= rating ? "#c9a84c" : "var(--border-light)" }} />
    ))}
  </div>
);

const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <FiStar size={26}
            style={{
              color: s <= (hover || value) ? "#c9a84c" : "var(--border-light)",
              fill:  s <= (hover || value) ? "#c9a84c" : "var(--border-light)",
            }}
          />
        </button>
      ))}
      <span className="text-sm ml-1 self-center" style={{ color: "var(--text-muted)" }}>
        {["", "Bohot bura", "Theek hai", "Acha", "Bohot acha", "Zabardast! ⭐"][hover || value]}
      </span>
    </div>
  );
};

/* ── REVIEW SUBMIT MODAL ── */
function ReviewModal({ onClose, onSuccess, userName }) {
  const { token } = useAuth();
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";
  const [form, setForm] = useState({ rating: 5, comment: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) { toast.error("Review likhna zaroori hai"); return; }
    if (form.comment.trim().length < 15) { toast.error("Thodi zyada detail likhein (15+ characters)"); return; }
    setLoading(true);
    try {
      const res = await api.post("/settings/user-review", {
        rating: form.rating,
        comment: form.comment.trim(),
        city: form.city.trim() || "Pakistan",
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { setSubmitted(true); onSuccess?.(); }
      else toast.error(res.data.message || "Submit nahi hua");
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center">
              <FiEdit3 size={15} className="text-black" />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Apni Review Likhein</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{userName} ke taraf se</p>
            </div>
          </div>
          <button onClick={onClose} className="transition-colors p-1.5 rounded-lg"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                <FiCheck size={28} className="text-black" />
              </motion.div>
              <h4 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Shukriya! 🎉</h4>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Aapki review submit ho gayi hai.</p>
              <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>Admin approval ke baad homepage pe show hogi.</p>
              <button onClick={onClose} className="btn-gold" style={{ padding: "12px 32px" }}>Theek Hai</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-3"
                  style={{ color: "var(--text-muted)" }}>Rating dijiye *</label>
                <StarInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}>Aapka Sheher</label>
                <input
                  type="text" placeholder="Lahore, Karachi, Islamabad..."
                  value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="lux-input" maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}>
                  Apna Experience Likhein *
                  <span className="ml-2 normal-case" style={{ color: "var(--text-muted)" }}>
                    {form.comment.length}/300
                  </span>
                </label>
                <textarea
                  placeholder={`${brandName} ke baare mein apna feedback share karein — quality, delivery, service...`}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value.slice(0, 300) })}
                  rows={4} className="lux-input resize-none"
                  style={{ resize: "none" }} required
                />
                {form.comment.length > 0 && form.comment.length < 15 && (
                  <p className="text-orange-400 text-xs mt-1">Thodi zyada detail likhein...</p>
                )}
              </div>

              <div className="rounded-xl px-4 py-3 text-xs flex items-start gap-2"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                <FiCheck size={12} style={{ color: "var(--gold)", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ color: "var(--text-muted)" }}>
                  Review admin se approve hone ke baad show hogi. Fake ya inappropriate reviews delete ho sakti hain.
                </span>
              </div>

              <button type="submit" disabled={loading || form.comment.length < 15}
                className="btn-gold w-full disabled:opacity-40"
                style={{ width: "100%", padding: "14px" }}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Submit ho raha hai...
                  </span>
                ) : (
                  <><FiCheck size={15} /> Review Submit Karein</>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── MAIN REVIEWS SECTION ── */
export default function Reviews() {
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";
  const { token, user } = useAuth();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused]       = useState(false);
  const [showModal, setShowModal] = useState(false);

  const reviews = (settings?.reviews?.filter((r) => r.isActive !== false) || []).length > 0
    ? settings.reviews.filter((r) => r.isActive !== false)
    : DEFAULT_REVIEWS;

  const VISIBLE = 3;
  const next = () => setActiveIdx((i) => (i + 1) % reviews.length);
  const prev = () => setActiveIdx((i) => (i - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    if (paused || showModal) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [paused, showModal, reviews.length]);

  const avgRating = reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length;

  const getVisible = () => {
    const result = [];
    for (let i = 0; i < Math.min(VISIBLE, reviews.length); i++) {
      result.push(reviews[(activeIdx + i) % reviews.length]);
    }
    return result;
  };

  return (
    <>
      <section className="py-20 sm:py-24 px-4 sm:px-6" style={{ background: "var(--bg-deep)" }}>
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <p className="section-label mb-2">Customer Reviews</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                Customers Ka <span className="gold-text">Kya Kehna Hai</span>
              </h2>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <StarRow rating={Math.round(avgRating)} size={16} />
                <span className="font-bold font-display text-lg" style={{ color: "var(--gold)" }}>
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  ({reviews.length} reviews)
                </span>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition-all"
                  style={token
                    ? { borderColor: "rgba(201,168,76,0.3)", color: "var(--gold)" }
                    : { borderColor: "var(--border)", color: "var(--text-muted)" }
                  }
                  onMouseEnter={e => {
                    e.currentTarget.style.background = token ? "rgba(201,168,76,0.08)" : "var(--bg-elevated)";
                  }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {token ? <FiEdit3 size={13} /> : <FiLock size={13} />}
                  {token ? "Review Likhein" : "Login Karein aur Review Dein"}
                </button>
              </div>
            </div>

            {/* NAV ARROWS */}
            {reviews.length > VISIBLE && (
              <div className="flex gap-2">
                {[{ fn: () => { prev(); setPaused(true); }, Icon: FiChevronLeft },
                  { fn: () => { next(); setPaused(true); }, Icon: FiChevronRight }].map(({ fn, Icon }, i) => (
                  <button key={i} onClick={fn}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CARDS */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="popLayout">
              {getVisible().map((review, i) => (
                <motion.div
                  key={`${review._id}-${activeIdx}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <FiMessageSquare size={14} style={{ color: "var(--gold)" }} />
                  </div>

                  <StarRow rating={review.rating || 5} size={14} />

                  <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                    "{review.comment}"
                  </p>

                  <div className="flex items-center gap-3 pt-2"
                    style={{ borderTop: "1px solid var(--border)" }}>
                    <AvatarCircle name={review.name} size={40} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{review.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{review.city || "Pakistan"}</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
                      style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                      Verified ✓
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* DOTS */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-8">
              {reviews.map((_, i) => (
                <button key={i}
                  onClick={() => { setActiveIdx(i); setPaused(true); }}
                  className="transition-all duration-400 rounded-full"
                  style={{
                    width: i === activeIdx ? 24 : 6,
                    height: 6,
                    background: i === activeIdx
                      ? "linear-gradient(90deg, #c9a84c, #e8c56a)"
                      : "var(--border)",
                  }}
                />
              ))}
            </div>
          )}

          {/* LOGIN CTA */}
          {!token && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-8 text-center rounded-2xl px-6 py-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                🌟 Kya aap {brandName} customer hain?{" "}
                <strong style={{ color: "var(--text-primary)" }}>Apna feedback share karein!</strong>
              </p>
              <div className="flex items-center gap-3 justify-center flex-wrap">
                <Link to="/login" className="btn-gold" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
                  Login Karein
                </Link>
                <Link to="/signup" className="btn-outline" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
                  Account Banayein
                </Link>
              </div>
            </motion.div>
          )}

          {/* TRUST STRIP */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-8 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-around gap-6 text-center"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            {[
              { val: `${reviews.length}+`, label: "Customer Reviews", icon: "⭐" },
              { val: `${avgRating.toFixed(1)}/5`, label: "Average Rating", icon: "📊" },
              { val: "98%", label: "Satisfied Customers", icon: "😊" },
              { val: "100%", label: "Original Products", icon: "✅" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl sm:text-2xl">{s.icon}</div>
                <div className="font-display text-xl font-bold gold-text mt-1">{s.val}</div>
                <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {showModal && (
          token ? (
            <ReviewModal
              onClose={() => setShowModal(false)}
              onSuccess={() => {}}
              userName={user?.name || "User"}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              onClick={() => setShowModal(false)}
            >
              <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="relative rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                  <FiLock size={22} className="text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Login Zaroori Hai</h3>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Review dene ke liye pehle account mein login karein.
                </p>
                <div className="flex gap-3">
                  <Link to="/login" className="btn-gold flex-1" style={{ padding: "12px" }}
                    onClick={() => setShowModal(false)}>Login</Link>
                  <button onClick={() => setShowModal(false)} className="btn-outline flex-1"
                    style={{ padding: "12px" }}>Cancel</button>
                </div>
              </motion.div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </>
  );
}
