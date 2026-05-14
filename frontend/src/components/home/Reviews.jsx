import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
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
    <div className="rounded-full flex items-center justify-center font-display font-bold text-black shrink-0 shadow-lg shadow-black/10"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const StarRow = ({ rating, size = 14 }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((s) => (
      <FiStar key={s} size={size}
        style={{ color: s <= rating ? "#c9a84c" : "var(--border-light)",
                 fill:  s <= rating ? "#c9a84c" : "transparent" }} />
    ))}
  </div>
);

const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-125"
        >
          <FiStar size={28}
            style={{
              color: s <= (hover || value) ? "#c9a84c" : "var(--border-light)",
              fill:  s <= (hover || value) ? "#c9a84c" : "transparent",
            }}
          />
        </button>
      ))}
    </div>
  );
};

/* ── REVIEW SUBMIT MODAL ── */
function ReviewModal({ onClose, onSuccess, userName }) {
  const { token } = useAuth();
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
      className="fixed inset-0 z-100 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-(--border)">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-(--gold)/20">
              <FiEdit3 size={18} className="text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-(--text-primary)">Share Your Story</h3>
              <p className="text-xs text-(--text-muted)">Posting as {userName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-all">
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6 shadow-xl shadow-(--gold)/30">
                <FiCheck size={36} className="text-black" />
              </div>
              <h4 className="font-display text-2xl font-bold text-(--text-primary) mb-3">Thank You! 🎉</h4>
              <p className="text-(--text-muted) mb-8">Aapki review submit ho gayi hai. Admin approval ke baad yeh homepage pe nazar aayegi.</p>
              <button onClick={onClose} className="btn-gold w-full py-4 rounded-2xl">Excellent</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-bold text-(--text-muted) mb-4 text-center">Rate Your Experience</label>
                <div className="flex justify-center">
                  <StarInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
                <p className="text-center text-sm mt-3 font-medium text-(--gold)">
                  {["", "Disappointing", "Fair", "Good", "Great", "Amazing!"][form.rating]}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-(--text-muted) mb-2">City</label>
                  <input
                    type="text" placeholder="e.g. Lahore, Karachi, London..."
                    value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="lux-input py-3.5" maxLength={50}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-(--text-muted) mb-2 flex justify-between">
                    Your Feedback
                    <span className="font-normal text-[10px]">{form.comment.length}/300</span>
                  </label>
                  <textarea
                    placeholder={`Tell us about the quality, fit, and delivery...`}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value.slice(0, 300) })}
                    rows={4} className="lux-input resize-none py-4"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || form.comment.length < 15}
                className="btn-gold w-full py-4 rounded-2xl shadow-xl shadow-(--gold)/20 disabled:opacity-40"
              >
                {loading ? "Submitting..." : "Post Review"}
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
  const { token, user } = useAuth();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused]       = useState(false);
  const [showModal, setShowModal] = useState(false);

  const reviews = (settings?.reviews?.filter((r) => r.isActive !== false) || []).length > 0
    ? settings.reviews.filter((r) => r.isActive !== false)
    : DEFAULT_REVIEWS;

  const VISIBLE = 3;
  const next = useCallback(() => setActiveIdx((i) => (i + 1) % reviews.length), [reviews.length]);
  const prev = () => setActiveIdx((i) => (i - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    if (paused || showModal) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, showModal, reviews.length, next]);

  const avgRating = reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length;

  const getVisible = () => {
    const result = [];
    const len = Math.min(VISIBLE, reviews.length);
    for (let i = 0; i < len; i++) {
      result.push(reviews[(activeIdx + i) % reviews.length]);
    }
    return result;
  };

  return (
    <>
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-(--bg-deep) relative overflow-hidden transition-colors duration-500">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-(--gold)/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-(--gold)/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-1.5 rounded-full border border-(--gold)/20 bg-(--gold)/5 text-(--gold) text-[10px] uppercase tracking-[0.2em] font-bold mb-5 backdrop-blur-sm">
                Community Stories
              </div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-(--text-primary) leading-tight mb-6">
                Voices Of The <span className="gold-text italic">Urban Thread</span>
              </h2>
              
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left py-6">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-4xl font-bold gold-text leading-none">{avgRating.toFixed(1)}</span>
                    <StarRow rating={Math.round(avgRating)} size={18} />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-(--text-muted) mt-2 font-bold">Based on {reviews.length} Verified Reviews</span>
                </div>

                <div className="h-10 w-px bg-(--border) hidden sm:block" />

                <button
                  onClick={() => setShowModal(true)}
                  className="group flex items-center gap-3 text-sm font-bold px-6 py-3.5 rounded-2xl transition-all bg-(--bg-deep) border border-(--border) hover:border-(--gold)/40 text-(--text-primary) shadow-xl shadow-black/5"
                >
                  <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black shadow-lg shadow-(--gold)/20">
                    {token ? <FiEdit3 size={14} /> : <FiLock size={14} />}
                  </div>
                  {token ? "Post Your Story" : "Login to Review"}
                </button>
              </div>
            </div>

            {/* NAV ARROWS */}
            {reviews.length > VISIBLE && (
              <div className="flex gap-3">
                <button onClick={() => { prev(); setPaused(true); }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-(--bg-deep) border border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/40 shadow-xl shadow-black/5 active:scale-95"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button onClick={() => { next(); setPaused(true); }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-(--bg-deep) border border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/40 shadow-xl shadow-black/5 active:scale-95"
                >
                  <FiChevronRight size={24} />
                </button>
              </div>
            )}
          </div>

          {/* CARDS GRID */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="popLayout">
              {getVisible().map((review, i) => (
                <motion.div
                  key={`${review._id}-${activeIdx}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group rounded-[2.5rem] p-8 sm:p-10 flex flex-col gap-6 transition-all duration-500 bg-(--bg-deep) border border-(--border) hover:border-(--gold)/30 shadow-2xl shadow-black/5"
                >
                  <div className="absolute top-8 right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FiMessageSquare size={80} className="text-(--gold)" />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <StarRow rating={review.rating || 5} size={15} />
                    <span className="text-[10px] uppercase tracking-widest font-black text-(--gold) px-3 py-1 rounded-full bg-(--gold)/10">Verified ✓</span>
                  </div>

                  <p className="text-base sm:text-lg leading-relaxed flex-1 text-(--text-secondary) font-light italic relative z-10">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-(--border) relative z-10">
                    <AvatarCircle name={review.name} size={48} />
                    <div>
                      <p className="font-display font-bold text-base text-(--text-primary)">{review.name}</p>
                      <p className="text-xs uppercase tracking-widest text-(--text-muted) font-medium">{review.city || "Pakistan"}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* PAGINATION DOTS */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2.5 mt-16">
              {reviews.map((_, i) => (
                <button key={i}
                  onClick={() => { setActiveIdx(i); setPaused(true); }}
                  className="transition-all duration-500 rounded-full"
                  style={{
                    width: i === activeIdx ? 40 : 10,
                    height: 8,
                    background: i === activeIdx
                      ? "var(--gold)"
                      : "var(--border)",
                  }}
                />
              ))}
            </div>
          )}
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
              className="fixed inset-0 z-100 flex items-center justify-center px-4"
              onClick={() => setShowModal(false)}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl overflow-hidden"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-6 shadow-xl shadow-(--gold)/30">
                  <FiLock size={32} className="text-black" />
                </div>
                <h3 className="font-display text-2xl font-bold text-(--text-primary) mb-3">Login Required</h3>
                <p className="text-(--text-muted) mb-8">Please sign in to your account to share your experience with the community.</p>
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="btn-gold py-4 rounded-2xl" onClick={() => setShowModal(false)}>Sign In</Link>
                  <button onClick={() => setShowModal(false)} className="text-sm font-bold text-(--text-muted) hover:text-(--text-primary) transition-colors py-2">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </>
  );
}
