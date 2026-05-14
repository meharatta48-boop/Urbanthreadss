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
    <div className="min-h-screen overflow-hidden pt-4 pb-20" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-1" style={{ color: "var(--text-muted)" }}>
          <button 
            onClick={() => navigate("/")} 
            className="transition-colors shrink-0" 
            style={{ color: "var(--text-muted)", minHeight: '32px' }} 
            onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} 
            onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}
          >
            Home
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate("/shop")} 
            className="transition-colors shrink-0" 
            style={{ color: "var(--text-muted)", minHeight: '32px' }} 
            onMouseEnter={e=>e.currentTarget.style.color="var(--text-primary)"} 
            onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}
          >
            Shop
          </button>
          {product.category?.name && <><span>/</span><span className="capitalize shrink-0" style={{ color: "var(--text-muted)" }}>{product.category.name}</span></>}
          <span>/</span>
          <span className="truncate max-w-30 sm:max-w-50" style={{ color: "var(--text-secondary)" }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ════ LEFT: IMAGES ════ */}
          <div className="space-y-3">
            {/* MAIN IMAGE */}
            <div className="product-gallery">
              <div className="product-gallery-main">
                <LazyImage
                  src={getProductImageUrl(images[activeImg])}
                  srcSet={getResponsiveImageSrcSet(images[activeImg], 800)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Gallery Overlay */}
                <div className="product-gallery-overlay">
                  {product.comparePrice > product.price && (
                    <div className="product-gallery-badge">
                      -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                    </div>
                  )}
                </div>
                
                {/* Zoom Button */}
                <div className="product-gallery-zoom">
                  <FiZoomIn size={20} />
                </div>
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImg} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-(--bg-deep)/40 backdrop-blur rounded-full flex items-center justify-center text-(--text-primary) hover:bg-(--bg-deep)/90 transition-all"
                    >
                      <FiChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={nextImg} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-(--bg-deep)/40 backdrop-blur rounded-full flex items-center justify-center text-(--text-primary) hover:bg-(--bg-deep)/90 transition-all"
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="product-gallery-thumbnails">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImg(i)}
                    className={`product-gallery-thumbnail ${
                      activeImg === i ? "active" : ""
                    }`}
                  >
                    <LazyImage 
                      src={getThumbnailUrl(img)} 
                      alt={`thumb-${i}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* PRODUCT VIDEO */}
            {product.video && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                  <FiPlay size={13} style={{ color: "var(--gold)" }} />
                  <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Product Video</span>
                </div>
                <video
                  src={getImageUrl(product.video)}
                  controls
                  className="w-full max-h-64 object-contain bg-(--bg-deep)"
                  preload="metadata"
                />
              </div>
            )}
          </div>

          {/* ════ RIGHT: DETAILS ════ */}
          <div className="space-y-5">

            {/* BADGES */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category?.name && <span className="badge-gold capitalize">{product.category.name}</span>}
              {product.subCategory?.name && (
                <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  {product.subCategory.name}
                </span>
              )}
              {product.isFeatured && (
                <span className="text-xs text-(--gold) border border-(--gold)/20 px-2 py-0.5 rounded-full">★ Featured</span>
              )}
            </div>

            {/* NAME & PRICE */}
            <div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-3 flex-wrap">
                <span className="font-display text-3xl sm:text-4xl font-bold gold-text">
                  Rs. {product.price?.toLocaleString()}
                </span>
                {product.comparePrice > product.price && (
                  <span className="text-lg line-through" style={{ color: "var(--text-muted)" }}>Rs. {product.comparePrice?.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="text-green-400 text-sm font-semibold">{discount}% off</span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="leading-relaxed text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>{product.description}</p>
            )}

            <div className="border-t" style={{ borderColor: "var(--border)" }} />

            {/* ════ SIZE SELECTOR ════ */}
            {product.sizes?.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSize(s); setSizeError(false); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        size === s
                          ? "bg-(--gold) text-black"
                          : "border border-(--border-light) text-(--text-secondary) hover:border-(--gold)"
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError && <p className="text-xs text-red-500">Please select a size</p>}
              </div>
            )}

            {/* ════ COLOR SELECTOR ════ */}
            {product.colors?.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setColorError(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        color === c
                          ? "bg-(--gold) text-black"
                          : "border border-(--border-light) text-(--text-secondary) hover:border-(--gold)"
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-(--border-light)"
                        style={{ backgroundColor: getColorHex(c) || '#ccc' }}
                      />
                      {c}
                    </button>
                  ))}
                </div>
                {colorError && <p className="text-xs text-red-500">Please select a color</p>}
              </div>
            )}

            {/* No sizes/colors — just a note */}
            {(!product.sizes?.length && !product.colors?.length) && (
              <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                📦 Yeh product ek standard size/color mein available hai
              </div>
            )}

            {/* ════ QUANTITY ════ */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-12 rounded-lg border border-(--border-light) flex items-center justify-center transition-all hover:border-(--gold)"
                  style={{ minHeight: '48px' }}
                >
                  <FiMinus size={16} style={{ color: "var(--text-secondary)" }} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock || 99}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(product.stock || 99, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center font-semibold"
                  style={{ 
                    background: "var(--bg-elevated)", 
                    border: "1px solid var(--border-light)",
                    borderRadius: "8px",
                    padding: "8px",
                    color: "var(--text-primary)"
                  }}
                />
                <button
                  onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                  className="w-12 h-12 rounded-lg border border-(--border-light) flex items-center justify-center transition-all hover:border-(--gold)"
                  style={{ minHeight: '48px' }}
                >
                  <FiPlus size={16} style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
            </div>

            {/* STOCK STATUS */}
            {product.stock > 0 && product.stock <= 10 && (
              <span className="text-orange-400 text-sm font-medium animate-pulse">
                ⚡ Sirf {product.stock} bacha hai!
              </span>
            )}
            {product.stock > 10 && (
              <span className="text-green-400 text-xs">✓ In Stock</span>
            )}
            {product.stock === 0 && (
              <span className="text-red-400 text-sm font-medium">✗ Out of Stock</span>
            )}

            {/* ════ ACTION BUTTONS ════ */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-gold flex-1 min-w-32.5 disabled:opacity-40 disabled:cursor-not-allowed animate-slide-up"
                style={{ padding: "16px 24px", fontSize: "1rem" }}
              >
                <FiShoppingCart size={17} /> Add to Cart
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-outline flex-1 min-w-32.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ padding: "16px 24px", fontSize: "1rem" }}
              >
                Buy Now
              </motion.button>

              <button
                onClick={() => setWishlist(!wishlist)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  wishlist
                    ? "border-red-400/50 bg-red-900/15 text-red-400"
                    : "border-(--border-light) text-(--text-muted) hover:text-red-500 hover:border-red-500/30"
                }`}
                title="Wishlist mein add karo"
              >
                <FiHeart size={18} className={wishlist ? "fill-red-400" : ""} />
              </button>

              {/* SHARE BUTTON */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    shareOpen
                      ? "border-(--gold)/50 bg-(--gold)/8 text-(--gold)"
                      : "border-(--border-light) text-(--text-muted) hover:text-(--text-primary) hover:border-(--gold)/50"
                  }`}
                  title="Share karo"
                >
                  <FiShare2 size={18} />
                </button>

                {/* SHARE DROPDOWN */}
                <AnimatePresence>
                  {shareOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 bg-(--bg-card) border border-(--border) rounded-2xl shadow-2xl overflow-hidden z-20 min-w-50"
                    >
                      <div className="px-4 py-3 border-b border-(--border)">
                        <p className="text-(--text-primary) text-xs font-semibold">Share Product</p>
                        <p className="text-(--text-muted) text-[10px] mt-0.5 truncate max-w-40">{product.name}</p>
                      </div>

                      <button
                        onClick={handleWhatsAppShare}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
                      >
                        <span className="text-base">💬</span> WhatsApp pe Share
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
                      >
                        {copied
                          ? <><FiCheck size={15} className="text-green-400" /> Link Copy Ho Gaya!</>
                          : <><FiLink size={15} /> Link Copy Karo</>
                        }
                      </button>

                      <button
                        onClick={() => {
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
                          setShareOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
                      >
                        <span className="text-base">📘</span> Facebook pe Share
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ════ GUARANTEES ════ */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🚚", title: "Free Delivery", sub: "Rs. 2000+ orders" },
                { icon: "✅", title: "100% Original", sub: "Guaranteed quality" },
                { icon: "↩️", title: "Easy Return", sub: "7 din mein" },
              ].map((g) => (
                <div key={g.title} className="flex flex-col items-center text-center gap-1 rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{g.title}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{g.sub}</span>
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Customer Reviews
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <FiStar key={s} size={16}
                    style={s <= Math.round(avgRating)
                      ? { color: "var(--gold)", fill: "var(--gold)" }
                      : { color: "var(--border-light)", fill: "var(--border-light)" }}
                  />
                ))}
              </div>
              <span className="text-[#c9a84c] font-bold font-display">{avgRating.toFixed(1)}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>({reviews.length} reviews)</span>
            </div>
          </div>

          {token && !hasReviewed && (
            <button onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-(--gold)/30 text-(--gold) hover:bg-(--gold)/8 transition-all">
              <FiEdit3 size={14} /> Review Likhein
            </button>
          )}
          {!token && (
            <Link to="/login"
              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              <FiLock size={14} /> Login Kar ke Review Dein
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
                          className="absolute inset-0 bg-(--bg-deep)/40 dark:bg-black/70 hidden group-hover:flex items-center justify-center text-(--text-primary) dark:text-white transition-colors"
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
                        className="absolute top-2 right-2 w-7 h-7 bg-(--bg-deep)/50 dark:bg-black/70 rounded-full flex items-center justify-center text-(--text-primary) dark:text-white hover:bg-red-600 transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => {
              const isOwn = r.user === user?.id || r.user?._id === user?.id || (r.user && r.user.toString() === user?.id);
              const colors = ["#c9a84c","#4ade80","#60a5fa","#c084fc","#f59e0b","#f87171"];
              const color = colors[(r.name?.charCodeAt(0) || 0) % colors.length];
              const hasMedia = (r.images?.length > 0) || r.video;
              return (
                <motion.div key={r._id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <FiStar key={s} size={13}
                        style={s <= r.rating
                          ? { color: "var(--gold)", fill: "var(--gold)" }
                          : { color: "var(--border-light)", fill: "var(--border-light)" }}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>"{ r.comment}"</p>

                  {/* ─── REVIEW IMAGES ─── */}
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {r.images.map((img, i) => (
                        <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer"
                          className="shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                          style={{ border: "1px solid var(--border)" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                          <img src={getImageUrl(img)} alt={`review-img-${i}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display="none"; }}
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* ─── REVIEW VIDEO ─── */}
                  {r.video && (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                      <video
                        src={getImageUrl(r.video)}
                        controls
                        className="w-full max-h-40 object-contain"
                        preload="metadata"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold font-display text-xs shrink-0"
                      style={{ background: color }}>
                      {r.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    {hasMedia && (
                      <span className="text-[9px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        {r.images?.length > 0 && <><FiCamera size={9}/> {r.images.length}</>}
                        {r.video && <FiVideo size={9} className="ml-1"/>}
                      </span>
                    )}
                    {(isOwn || user?.role === "admin") && (
                      <button onClick={() => handleDelete(r._id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                        <FiTrash2 size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
