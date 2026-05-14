import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../services/api";
import {
  FiShoppingCart, FiArrowLeft, FiChevronLeft, FiChevronRight,
  FiPackage, FiHeart, FiShare2, FiCheck, FiAlertCircle,
  FiLink, FiMessageCircle, FiStar, FiEdit3, FiTrash2, FiLock,
  FiCamera, FiVideo, FiX, FiPlay, FiZoomIn, FiMinus, FiPlus
} from "react-icons/fi";
import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { getProductImageUrl, getThumbnailUrl, getResponsiveImageSrcSet } from "../utils/cloudinaryOptimized";
import LazyImage from "../components/LazyImage";

const API_BASE = SERVER_URL;

/* ── Known color hex values for visual dots ── */
const COLOR_HEX = {
  black: "#111111", white: "#f5f5f5", navy: "#1a2e5a", grey: "#888888",
  gray: "#888888", beige: "#d9c9a8", brown: "#7c4a1e", olive: "#6b7c3e",
  red: "#c0392b", blue: "#2471a3", green: "#1a7a4a", yellow: "#f0c040",
  pink: "#e991b0", purple: "#7d3c98", orange: "#d35400", maroon: "#7b241c",
  "off white": "#f0ede6", "sky blue": "#87ceeb", "royal blue": "#4169e1",
  "light grey": "#c8c8c8", "dark green": "#1a4a2e",
};
const getColorHex = (name) => COLOR_HEX[name?.toLowerCase()] || null;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const brandName = settings?.brandName || "URBAN THREAD";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.data || res.data.product;
        setProduct(p);
        // Auto-select first if only 1 option
        if (p?.sizes?.length === 1) setSize(p.sizes[0]);
        if (p?.colors?.length === 1) setColor(p.colors[0]);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    
    // Dynamically inject OG tags for crawlers that support JS
    const upsertMeta = (property, content) => {
      let el = document.head.querySelector(`meta[property="${property}"]`) || document.head.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const title = `${product.name} - ${brandName}`;
    const desc = product.description || `Buy ${product.name} online in Pakistan.`;
    const image = product.images?.length > 0 ? getImageUrl(product.images[0]) : "";

    document.title = title;
    upsertMeta("description", desc);
    upsertMeta("og:title", title);
    upsertMeta("og:description", desc);
    if (image) upsertMeta("og:image", image);
    upsertMeta("og:url", window.location.href);
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", desc);
    if (image) upsertMeta("twitter:image", image);

  }, [product, brandName]);


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-deep)" }}>
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg-deep)", color: "var(--text-muted)" }}>
      <FiPackage size={48} />
      <p className="text-lg" style={{ color: "var(--text-primary)" }}>Product nahi mila</p>
      <button onClick={() => navigate("/shop")} className="btn-gold">Shop Karo</button>
    </div>
  );

  const images = product.images?.length ? product.images : [];
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  /* ── SHARE ── */
  const shareUrl = window.location.href;
  const shareText = `${product.name} — Rs. ${product.price?.toLocaleString()} | ${brandName}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: shareText, url: shareUrl });
        return;
      } catch { /* user cancelled */ }
    }
    setShareOpen((v) => !v);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copy ho gaya! 🔗');

    setTimeout(() => {
      setCopied(false);
      setShareOpen(false);
    }, 2000);
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`);
    setShareOpen(false);
  };

  /* ── VALIDATION & CART ── */
  const validateSelections = () => {
    if (product.sizes?.length > 0 && !size) {
      setSizeError(true);
      toast.error('⚠️ Pehle size choose karo!');
      return false;
    }

    if (product.colors?.length > 0 && !color) {
      setColorError(true);
      toast.error('⚠️ Pehle color choose karo!');
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelections()) return;

    addToCart({
      ...product,
      size,
      color,
      quantity: qty,
    });

    toast.success('Cart mein add ho gaya ✓');

    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!validateSelections()) return;

    addToCart({
      ...product,
      size,
      color,
      quantity: qty,
    });

    setTimeout(() => navigate('/checkout'), 100);
  };

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 text-white bg-(--bg-deep)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-(--gold) transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-(--gold) transition-colors">Shop</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <span className="capitalize">{product.category.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-(--gold) font-bold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-black/40 border border-white/5 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <LazyImage
                    src={getProductImageUrl(images[activeImg])}
                    srcSet={getResponsiveImageSrcSet(images[activeImg], 800)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <div className="bg-(--gold) text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                    {discount}% OFF
                  </div>
                )}
                {product.isFeatured && (
                  <div className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
                    ★ FEATURED
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button 
                    onClick={prevImg}
                    className="w-10 h-10 rounded-full bg-black/50 text-white pointer-events-auto hover:bg-(--gold) hover:text-black flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImg}
                    className="w-10 h-10 rounded-full bg-black/50 text-white pointer-events-auto hover:bg-(--gold) hover:text-black flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-(--gold) opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}
                >
                  <img src={getThumbnailUrl(img)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>

            {/* PRODUCT VIDEO */}
            {product.video && (
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/2">
                <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                  <FiPlay size={13} className="text-(--gold)" />
                  <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Product Video</span>
                </div>
                <video
                  src={getImageUrl(product.video)}
                  controls
                  className="w-full max-h-64 object-contain bg-black/40"
                  preload="metadata"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            <div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold leading-tight mb-4" style={{ color: "var(--text-primary)" }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl sm:text-4xl font-bold gold-text">Rs. {product.price?.toLocaleString()}</span>
                {product.comparePrice > product.price && (
                  <span className="text-xl line-through opacity-30">Rs. {product.comparePrice?.toLocaleString()}</span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm sm:text-base opacity-60 leading-relaxed max-w-xl">{product.description}</p>
            )}

            {/* SIZE */}
            {product.sizes?.length > 0 && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button 
                      key={s} 
                      onClick={() => {setSize(s); setSizeError(false)}} 
                      className={`px-6 py-2.5 rounded-xl font-bold border transition-all ${size === s ? "bg-(--gold) text-black border-(--gold)" : "border-white/10 opacity-60 hover:border-(--gold) hover:opacity-100"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError && <p className="text-xs text-red-500 font-medium">⚠️ Please select a size</p>}
              </div>
            )}

            {/* COLOR */}
            {product.colors?.length > 0 && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Select Color</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(c => (
                    <button 
                      key={c} 
                      onClick={() => {setColor(c); setColorError(false)}} 
                      className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all ${color === c ? "border-(--gold) bg-(--gold)/10 text-(--gold)" : "border-white/10 opacity-60 hover:border-(--gold) hover:opacity-100"}`}
                    >
                      <span className="w-4 h-4 rounded-full shadow-inner" style={{ background: getColorHex(c) || '#444' }} />
                      <span className="text-xs font-bold uppercase tracking-wider">{c}</span>
                    </button>
                  ))}
                </div>
                {colorError && <p className="text-xs text-red-500 font-medium">⚠️ Please select a color</p>}
              </div>
            )}

            {/* ACTION BAR */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl h-14 overflow-hidden">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <FiMinus />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{qty}</span>
                  <button 
                    onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} 
                    className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <FiPlus />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart} 
                  disabled={product.stock === 0} 
                  className="btn-gold flex-1 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-gold/10 flex items-center justify-center gap-3"
                >
                  <FiShoppingCart /> Add to Cart
                </button>

                <button
                  onClick={() => setWishlist(!wishlist)}
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all ${
                    wishlist
                      ? "border-red-500/50 bg-red-500/10 text-red-500"
                      : "border-white/10 text-white/20 hover:text-red-500 hover:border-red-500/30"
                  }`}
                >
                  <FiHeart size={20} className={wishlist ? "fill-red-500" : ""} />
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleBuyNow} 
                  disabled={product.stock === 0} 
                  className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Buy Now
                </button>
                
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className={`w-14 h-full flex items-center justify-center rounded-2xl border border-white/10 transition-all ${
                      shareOpen ? "bg-white/10 border-white/20" : "hover:bg-white/5"
                    }`}
                  >
                    <FiShare2 size={20} />
                  </button>

                  <AnimatePresence>
                    {shareOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 bottom-full mb-4 bg-(--bg-card) border border-(--border) rounded-2xl shadow-2xl overflow-hidden z-20 min-w-50 backdrop-blur-xl"
                      >
                        <button onClick={handleWhatsAppShare} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                          <span className="text-base">💬</span> WhatsApp
                        </button>
                        <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                          {copied ? <><FiCheck size={15} className="text-green-400" /> Copied!</> : <><FiLink size={15} /> Copy Link</>}
                        </button>
                        <button onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`); setShareOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                          <span className="text-base">📘</span> Facebook
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* STOCK STATUS */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  In Stock {product.stock <= 10 && `(Only ${product.stock} left!)`}
                </div>
              ) : (
                <div className="text-red-400 text-xs font-bold">✗ Out of Stock</div>
              )}
            </div>

            {/* GUARANTEES */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
              {[
                { icon: "🚚", title: "Free Delivery", sub: "Above Rs. 2000" },
                { icon: "✅", title: "Original", sub: "100% Guaranteed" },
                { icon: "↩️", title: "Easy Return", sub: "7 Day Policy" },
              ].map((g) => (
                <div key={g.title} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-2xl bg-white/2 border border-white/5">
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">{g.title}</span>
                  <span className="text-[9px] opacity-40">{g.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ PRODUCT REVIEWS ════ */}
        {product && <ProductReviews product={product} setProduct={setProduct} />}

      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   PRODUCT REVIEWS COMPONENT
════════════════════════════════════════ */
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <FiStar size={24}
            className={s <= (hover || value) ? "fill-(--gold) text-(--gold)" : "text-(--border-light) fill-(--bg-elevated)"}
          />
        </button>
      ))}
      <span className="text-(--text-muted) text-sm ml-1 self-center">
        {["","Bura","Theek","Acha","Bahut Acha","Zabardast! ⭐"][hover || value]}
      </span>
    </div>
  );
};

function ProductReviews({ product, setProduct }) {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // --- Media state ---
  const [reviewImages, setReviewImages] = useState([]);   // File objects
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]); // blob URLs
  const [reviewVideo, setReviewVideo] = useState(null);   // File object
  const [reviewVideoPreview, setReviewVideoPreview] = useState(""); // blob URL
  const imgInputRef = useRef();
  const vidInputRef = useRef();

  const reviews = product.reviews || [];
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const hasReviewed = reviews.some((r) => r.user === user?.id || r.user?._id === user?.id);

  const handleImagePick = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 4 - reviewImages.length;
    const picked = files.slice(0, remaining);
    if (!picked.length) return;
    setReviewImages((prev) => [...prev, ...picked]);
    setReviewImagePreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(reviewImagePreviews[idx]);
    setReviewImages((prev) => prev.filter((_, i) => i !== idx));
    setReviewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVideoPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (reviewVideoPreview) URL.revokeObjectURL(reviewVideoPreview);
    setReviewVideo(file);
    setReviewVideoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeVideo = () => {
    if (reviewVideoPreview) URL.revokeObjectURL(reviewVideoPreview);
    setReviewVideo(null);
    setReviewVideoPreview("");
  };

  const resetForm = () => {
    reviewImagePreviews.forEach((u) => URL.revokeObjectURL(u));
    if (reviewVideoPreview) URL.revokeObjectURL(reviewVideoPreview);
    setReviewImages([]);
    setReviewImagePreviews([]);
    setReviewVideo(null);
    setReviewVideoPreview("");
    setForm({ rating: 5, comment: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.comment.trim().length < 10) { toast.error("Thodi zyada detail likhein"); return; }
    setLoading(true);
    try {
      // Build FormData for multipart upload
      const fd = new FormData();
      fd.append("rating", form.rating);
      fd.append("comment", form.comment);
      reviewImages.forEach((f) => fd.append("reviewImages", f));
      if (reviewVideo) fd.append("reviewVideo", reviewVideo);

      const res = await api.post(`/products/${product._id}/reviews`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        toast.success("Review add ho gayi! ⭐");
        setProduct((p) => ({ ...p, reviews: res.data.reviews, rating: res.data.rating, numReviews: res.data.numReviews }));
        resetForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally { setLoading(false); }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      const res = await api.delete(`/products/${product._id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduct((p) => ({ ...p, reviews: res.data.reviews, rating: res.data.rating || 0, numReviews: res.data.reviews.length }));
      toast.success("Review delete ho gayi");
    } catch { toast.error("Delete nahi hua"); }
  };

  return (
    <div className="mt-10 pt-10" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-0">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold">Reviews <span className="opacity-30 ml-2">{reviews.length}</span></h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex gap-1 text-(--gold)">
                {[1,2,3,4,5].map((s) => (
                  <FiStar key={s} size={14} className={s <= Math.round(avgRating) ? "fill-current" : "opacity-20"} />
                ))}
              </div>
              <span className="text-sm font-bold opacity-60">{avgRating.toFixed(1)} Average</span>
            </div>
          </div>

          {token && !hasReviewed && !showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <FiEdit3 size={16} /> Write Review
            </button>
          )}

          {!token && (
            <Link 
              to="/login"
              className="px-6 py-3 rounded-xl border border-white/10 text-xs font-bold opacity-40 hover:opacity-100 transition-all flex items-center gap-2"
            >
              <FiLock size={14} /> Login to Review
            </Link>
          )}
        </div>

        {/* WRITE REVIEW FORM */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl p-5 sm:p-6 mb-6 overflow-hidden"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <FiEdit3 size={15} className="text-(--gold)" /> Apni Review Likhein
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Rating *</label>
                  <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Comment * <span className="normal-case" style={{ color: "var(--text-muted)" }}>{form.comment.length}/300</span>
                  </label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value.slice(0, 300) })}
                    rows={3} placeholder="Is product ke baare mein apna experience share karein..."
                    className="lux-input resize-none w-full" style={{ resize: "none" }}
                    required
                  />
                </div>

                {/* ─── PHOTO UPLOAD ─── */}
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    <FiCamera size={11} className="inline mr-1" />
                    Photos (max 4) <span className="normal-case" style={{ color: "var(--text-muted)" }}>Optional</span>
                  </label>
                  <input ref={imgInputRef} type="file" accept="image/*" multiple hidden onChange={handleImagePick} />
                  <div className="flex flex-wrap gap-2">
                    {reviewImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group"
                        style={{ border: "1px solid var(--border)" }}>
                        <img
                          src={src}
                          alt={`preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button" onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-(--bg-deep)/40 hidden group-hover:flex items-center justify-center text-(--text-primary) transition-colors"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    ))}
                    {reviewImages.length < 4 && (
                      <button
                        type="button" onClick={() => imgInputRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.color = "var(--gold)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                        <FiCamera size={20} />
                        <span className="text-[9px] text-center leading-tight">Photo<br/>Add</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ─── VIDEO UPLOAD ─── */}
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    <FiVideo size={11} className="inline mr-1" />
                    Video (max 1 clip, 50MB) <span className="normal-case" style={{ color: "var(--text-muted)" }}>Optional</span>
                  </label>
                  <input ref={vidInputRef} type="file" accept="video/*" hidden onChange={handleVideoPick} />
                  {reviewVideoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-(--border) bg-(--bg-deep) max-w-xs">
                      <video src={reviewVideoPreview} controls className="w-full max-h-48 object-contain" />
                      <button
                        type="button" onClick={removeVideo}
                        className="absolute top-2 right-2 w-7 h-7 bg-(--bg-deep)/50 rounded-full flex items-center justify-center text-(--text-primary) hover:bg-red-600 transition-colors"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button" onClick={() => vidInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm transition-all"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.color = "var(--gold)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      <FiVideo size={16} /> Video Upload Karein
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={loading || form.comment.length < 10}
                    className="btn-gold disabled:opacity-40" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
                    {loading ? "Submitting..." : "Submit Review"}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="btn-outline" style={{ padding: "10px 18px", fontSize: "0.85rem" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REVIEWS LIST */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <FiMessageCircle size={32} className="mx-auto mb-3" style={{ color: "var(--border-light)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Koi review nahi abhi — pehle review dein!</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => {
            const isOwn = r.user === user?.id || r.user?._id === user?.id || (r.user && r.user.toString() === user?.id);
            const hasMedia = (r.images?.length > 0) || r.video;
            return (
              <motion.div 
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/2 border border-white/5 rounded-3xl p-6 flex flex-col gap-4 hover:bg-white/3 transition-colors group relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-(--gold) text-black flex items-center justify-center font-bold text-sm">
                      {r.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{r.name}</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-(--gold)">
                    {[1,2,3,4,5].map((s) => (
                      <FiStar key={s} size={12} className={s <= r.rating ? "fill-current" : "opacity-20"} />
                    ))}
                  </div>
                </div>

                <p className="text-sm opacity-70 leading-relaxed italic">"{r.comment}"</p>

                {hasMedia && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                    {r.images?.map((img, i) => (
                      <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-xl overflow-hidden border border-white/5 shrink-0">
                        <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                      </a>
                    ))}
                    {r.video && (
                      <div className="w-32 h-20 rounded-xl overflow-hidden border border-white/5 bg-black shrink-0">
                        <video src={getImageUrl(r.video)} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {(isOwn || user?.role === "admin") && (
                  <button 
                    onClick={() => handleDelete(r._id)}
                    className="absolute top-6 right-6 p-2 text-white/0 group-hover:text-red-400 transition-all hover:bg-red-400/10 rounded-lg"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
