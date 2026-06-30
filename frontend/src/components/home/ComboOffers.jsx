import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiTag, FiLoader, FiPlus, FiMinus, FiShare2, FiLink, FiCheck } from "react-icons/fi";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import LazyImage from "../LazyImage";
import { getCartImageUrl } from "../../utils/cloudinaryOptimized";

export default function ComboOffers() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState({});
  const [shareOpen, setShareOpen] = useState({});
  const [copied, setCopied] = useState({});
  const [linkColors, setLinkColors] = useState({});  // per-combo: same color for both items
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const comboRefs = useRef({});

  useEffect(() => {
    setLoading(true);
    api
      .get("/combos")
      .then((res) => {
        const activeCombos = res.data.data || [];
        setCombos(activeCombos);

        // Initialize selections for each combo
        const initialSelections = {};
        activeCombos.forEach((c) => {
          if (c.products && c.products.length >= 2) {
            const p1 = c.products[0];
            const p2 = c.products[1];

            // Fallback colors/sizes if combo limits are empty
            const colors1 = p1.colors?.length ? p1.colors : p1.product?.colors || [];
            const sizes1 = p1.sizes?.length ? p1.sizes : p1.product?.sizes || [];
            const colors2 = p2.colors?.length ? p2.colors : p2.product?.colors || [];
            const sizes2 = p2.sizes?.length ? p2.sizes : p2.product?.sizes || [];

            initialSelections[c._id] = {
              0: {
                color: colors1[0] || "",
                size: sizes1[0] || "",
              },
              1: {
                color: colors2[0] || "",
                size: sizes2[0] || "",
              },
              quantity: 1,
            };
          }
        });
        setSelections(initialSelections);

        // Auto-scroll to combo if URL has #combo-ID
        setTimeout(() => {
          const hash = window.location.hash;
          if (hash && hash.startsWith("#combo-")) {
            const targetId = hash.replace("#", "");
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.style.boxShadow = "0 0 0 2px var(--gold)";
              setTimeout(() => { el.style.boxShadow = ""; }, 2500);
            }
          }
        }, 500);
      })
      .catch((err) => {
        console.error("Error fetching combos:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleShareToggle = (comboId) => {
    setShareOpen(prev => ({ ...prev, [comboId]: !prev[comboId] }));
  };

  const handleCopyLink = (combo) => {
    const link = `${window.location.origin}/#combo-${combo._id}`;
    navigator.clipboard.writeText(link);
    setCopied(prev => ({ ...prev, [combo._id]: true }));
    toast.success("Link copy ho gaya! 🔗");
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [combo._id]: false }));
      setShareOpen(prev => ({ ...prev, [combo._id]: false }));
    }, 2000);
  };

  const handleWhatsAppShare = async (combo, p1, p2) => {
    const link = `${window.location.origin}/#combo-${combo._id}`;
    const savings = combo.comparePrice > combo.price
      ? `\n💸 *Bachat:* Rs. ${(combo.comparePrice - combo.price).toLocaleString()} OFF!` : "";
    const items = `\n📦 *Includes:*\n  ✅ ${p1?.name || "Item 1"}\n  ✅ ${p2?.name || "Item 2"}`;
    const text = `🎉 *${combo.name}*\n━━━━━━━━━━━━━━━━━━━━\n💰 *Price:* Rs. ${combo.price?.toLocaleString()}${combo.comparePrice > combo.price ? `\n~~Rs. ${combo.comparePrice?.toLocaleString()}~~` : ""}${savings}${items}\n━━━━━━━━━━━━━━━━━━━━\n🛒 *Order Karo:* ${link}\n✨ _Urban Threads Pakistan_`;

    // Try Web Share API (shows image on mobile WhatsApp)
    const imageUrl = combo.images?.[0] || p1?.images?.[0];
    if (navigator.share && imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const ext = blob.type.includes("png") ? "png" : "jpg";
        const file = new File([blob], `combo-${combo._id}.${ext}`, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text, title: combo.name });
          setShareOpen(prev => ({ ...prev, [combo._id]: false }));
          return;
        }
      } catch (e) {
        // fallback to WhatsApp link
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    setShareOpen(prev => ({ ...prev, [combo._id]: false }));
  };

  const handleSelectionChange = (comboId, productIndex, key, value) => {
    setSelections((prev) => {
      const updated = {
        ...prev,
        [comboId]: {
          ...prev[comboId],
          [productIndex]: {
            ...prev[comboId]?.[productIndex],
            [key]: value,
          },
        },
      };
      // If same-color is linked and color changed on item 0 → mirror to item 1
      if (key === "color" && productIndex === 0 && linkColors[comboId]) {
        updated[comboId][1] = {
          ...updated[comboId][1],
          color: value,
        };
      }
      return updated;
    });
  };

  const toggleLinkColors = (comboId, currentColor) => {
    setLinkColors(prev => {
      const next = { ...prev, [comboId]: !prev[comboId] };
      // When turning ON, immediately sync item 1 color to item 2
      if (next[comboId] && currentColor) {
        setSelections(sel => ({
          ...sel,
          [comboId]: {
            ...sel[comboId],
            1: { ...sel[comboId]?.[1], color: currentColor },
          },
        }));
      }
      return next;
    });
  };

  const handleQuantityChange = (comboId, val) => {
    const currentQty = selections[comboId]?.quantity || 1;
    const newQty = Math.max(1, currentQty + val);
    setSelections((prev) => ({
      ...prev,
      [comboId]: {
        ...prev[comboId],
        quantity: newQty,
      },
    }));
  };

  const handleAddComboToCart = (combo) => {
    const sel = selections[combo._id];
    if (!sel) return;

    const p1Selection = sel[0];
    const p2Selection = sel[1];
    const quantity = sel.quantity || 1;

    // Validate that sizes and colors are selected
    if (combo.products[0]?.product?.colors?.length > 0 && !p1Selection.color) {
      toast.error(`Please select color for first item`);
      return;
    }
    if (combo.products[0]?.product?.sizes?.length > 0 && !p1Selection.size) {
      toast.error(`Please select size for first item`);
      return;
    }
    if (combo.products[1]?.product?.colors?.length > 0 && !p2Selection.color) {
      toast.error(`Please select color for second item`);
      return;
    }
    if (combo.products[1]?.product?.sizes?.length > 0 && !p2Selection.size) {
      toast.error(`Please select size for second item`);
      return;
    }

    const p1 = combo.products[0].product;
    const p2 = combo.products[1].product;

    // Create custom cart item for Combo
    const comboCartItem = {
      isCombo: true,
      _id: combo._id,
      name: combo.name,
      price: combo.price,
      quantity,
      images: combo.images?.length
        ? combo.images
        : [p1.images?.[0], p2.images?.[0]].filter(Boolean),
      comboItems: [
        {
          product: p1._id,
          name: p1.name,
          color: p1Selection.color,
          size: p1Selection.size,
          image: p1.images?.[0] || "",
        },
        {
          product: p2._id,
          name: p2.name,
          color: p2Selection.color,
          size: p2Selection.size,
          image: p2.images?.[0] || "",
        },
      ],
    };

    addToCart(comboCartItem);
    toast.success(`🎉 Combo "${combo.name}" added to cart!`);

    // Redirect to Checkout page as per requirements
    setTimeout(() => {
      navigate("/checkout");
    }, 400);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-(--bg-deep)">
        <FiLoader className="animate-spin text-(--gold)" size={32} />
        <p className="text-(--text-muted) text-sm mt-3">
          Loading premium combo offers...
        </p>
      </div>
    );
  }

  if (!combos.length) return null;

  return (
    <section
      className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* BACKGROUND SHADOW GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-(--gold)/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label mb-2 inline-flex items-center gap-1.5 bg-(--gold)/10 px-3 py-1 rounded-full text-xs font-semibold text-(--gold)">
              <FiTag size={12} /> Special Promotion
            </span>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Mix & Match <span className="gold-text">Combo Offers</span>
            </h2>
            <p
              className="text-sm max-w-lg mx-auto mt-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Double the style, double the savings. Customize your favorite colors
              and sizes together in a discounted package!
            </p>
          </motion.div>
        </div>

        {/* COMBOS GRID */}
        <div className="space-y-12 sm:space-y-16">
          {combos.map((combo) => {
            const p1 = combo.products[0]?.product;
            const p2 = combo.products[1]?.product;
            if (!p1 || !p2) return null;

            const sel = selections[combo._id] || { 0: {}, 1: {}, quantity: 1 };
            const discountPercent =
              combo.comparePrice > combo.price
                ? Math.round(
                  ((combo.comparePrice - combo.price) / combo.comparePrice) *
                  100
                )
                : 0;

            const colors1 = combo.products[0].colors?.length
              ? combo.products[0].colors
              : p1.colors || [];
            const sizes1 = combo.products[0].sizes?.length
              ? combo.products[0].sizes
              : p1.sizes || [];
            const colors2 = combo.products[1].colors?.length
              ? combo.products[1].colors
              : p2.colors || [];
            const sizes2 = combo.products[1].sizes?.length
              ? combo.products[1].sizes
              : p2.sizes || [];

            return (
              <motion.div
                key={combo._id}
                id={`combo-${combo._id}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center bg-(--bg-surface) p-5 sm:p-10 rounded-2xl border border-(--border) shadow-xl relative overflow-hidden"
                style={{ scrollMarginTop: "90px", transition: "box-shadow 0.4s ease" }}
              >
                {/* COMBO DISCOUNT BADGE */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4 z-30 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Save {discountPercent}%
                  </div>
                )}

                {/* SHARE BUTTON */}
                <div className="absolute top-4 left-4 z-30">
                  <button
                    onClick={() => handleShareToggle(combo._id)}
                    title="Share karo"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm transition-all shadow-lg ${
                      shareOpen[combo._id]
                        ? "text-black"
                        : "border text-white hover:bg-white/20"
                    }`}
                    style={shareOpen[combo._id]
                      ? { background: "var(--gold)", border: "none" }
                      : { background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.15)" }
                    }
                  >
                    <FiShare2 size={12} /> Share
                  </button>

                  <AnimatePresence>
                    {shareOpen[combo._id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        className="absolute left-0 top-full mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-44"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                      >
                        <div className="px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Share Deal</p>
                        </div>
                        <button
                          onClick={() => handleWhatsAppShare(combo, p1, p2)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-(--bg-elevated) text-left"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span>💬</span> WhatsApp
                        </button>
                        <button
                          onClick={() => handleCopyLink(combo)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-(--bg-elevated) text-left"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {copied[combo._id]
                            ? <><FiCheck size={14} className="text-green-400" /> Copied!</>
                            : <><FiLink size={14} /> Link Copy Karo</>
                          }
                        </button>
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/#combo-${combo._id}`;
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`);
                            setShareOpen(prev => ({ ...prev, [combo._id]: false }));
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-(--bg-elevated) text-left"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span>📘</span> Facebook
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* IMAGES SIDE BY SIDE (PRO MOBILE LOOK) */}
                <div className="lg:col-span-5 flex items-center justify-center gap-3 sm:gap-6 relative w-full pt-4 lg:pt-0">
                  {/* PRODUCT 1 */}
                  <div className="relative w-32 h-32 sm:w-44 sm:h-44 shrink-0 rounded-xl overflow-hidden bg-black/10 border border-white/5 aspect-square shadow-lg group">
                    <LazyImage
                      src={getCartImageUrl(combo.images?.[0] || p1.images?.[0])}
                      alt={p1.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <span className="text-[9px] sm:text-[10px] text-(--gold) font-bold tracking-widest uppercase shadow-black">
                        {combo.images?.[0] ? "Promo Item 1" : "Item #1"}
                      </span>
                      <p className="text-white text-[10px] sm:text-xs font-semibold truncate">
                        {p1.name}
                      </p>
                    </div>
                  </div>

                  {/* PLUS ICON BETWEEN IMAGES */}
                  <div className="bg-(--gold) w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-black font-extrabold border-2 border-black z-20 shadow-xl shrink-0">
                    <FiPlus size={20} className="sm:w-6 sm:h-6" />
                  </div>

                  {/* PRODUCT 2 */}
                  <div className="relative w-32 h-32 sm:w-44 sm:h-44 shrink-0 rounded-xl overflow-hidden bg-black/10 border border-white/5 aspect-square shadow-lg group">
                    <LazyImage
                      src={getCartImageUrl(combo.images?.[1] || p2.images?.[0])}
                      alt={p2.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <span className="text-[9px] sm:text-[10px] text-(--gold) font-bold tracking-widest uppercase">
                        {combo.images?.[1] ? "Promo Item 2" : "Item #2"}
                      </span>
                      <p className="text-white text-[10px] sm:text-xs font-semibold truncate">
                        {p2.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SELECTORS & INFO (lg:col-span-7) */}
                <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <h3
                      className="font-display text-2xl sm:text-3xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {combo.name}
                    </h3>
                    {combo.description && (
                      <p
                        className="text-xs mt-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {combo.description}
                      </p>
                    )}
                  </div>

                  {/* ══════ VARIANT CONTROLS ══════ */}
                  <div className="space-y-4">

                    {/* SAME COLOR TOGGLE — only show if both products have colors */}
                    {colors1.length > 0 && colors2.length > 0 && (() => {
                      const commonColors = colors1.filter(c => colors2.includes(c));
                      if (commonColors.length === 0) return null;
                      return (
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                          <div>
                            <p className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>🎨 Dono ka same color?</p>
                            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Color ek — size alag alag</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleLinkColors(combo._id, sel[0]?.color)}
                            className="relative flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
                            style={linkColors[combo._id]
                              ? { background: "var(--gold)", color: "#000" }
                              : { background: "rgba(255,255,255,0.08)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                            }
                          >
                            <span className={`w-3 h-3 rounded-full border-2 transition-all ${linkColors[combo._id] ? "bg-black border-black" : "bg-transparent border-current"}`} />
                            {linkColors[combo._id] ? "✓ Same Color ON" : "Same Color OFF"}
                          </button>
                        </div>
                      );
                    })()}

                    {/* ── SAME COLOR ON: Single color picker + 2 size pickers ── */}
                    {linkColors[combo._id] ? (() => {
                      const commonColors = colors1.filter(c => colors2.includes(c));
                      const sharedColor = sel[0]?.color;
                      return (
                        <div className="rounded-xl border border-(--border) overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                          {/* SHARED COLOR PICKER */}
                          {commonColors.length > 0 && (
                            <div className="px-4 py-3 border-b border-(--border)">
                              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                                style={{ color: "var(--gold)" }}>
                                🎨 Color — Dono Items ke liye
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {commonColors.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                      handleSelectionChange(combo._id, 0, "color", c);
                                    }}
                                    className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border font-semibold transition-all ${sharedColor === c
                                      ? "text-black shadow-md"
                                      : "text-(--text-secondary) hover:border-(--gold)/60"
                                    }`}
                                    style={sharedColor === c
                                      ? { background: "var(--gold)", borderColor: "var(--gold)" }
                                      : { background: "transparent", borderColor: "var(--border)" }
                                    }
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                              {sharedColor && (
                                <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
                                  ✓ <strong style={{ color: "var(--gold)" }}>{sharedColor}</strong> — dono items ke liye select hai
                                </p>
                              )}
                            </div>
                          )}

                          {/* TWO SIZE PICKERS SIDE BY SIDE */}
                          <div className="grid grid-cols-2 divide-x divide-(--border)">
                            {/* Item 1 Size */}
                            <div className="px-3 py-3 space-y-2">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-black" style={{ background: "var(--gold)" }}>1</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: "var(--text-primary)" }}>{p1.name}</span>
                              </div>
                              {sizes1.length > 0 ? (
                                <>
                                  <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Size</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {sizes1.map((s) => (
                                      <button key={s} type="button"
                                        onClick={() => handleSelectionChange(combo._id, 0, "size", s)}
                                        className={`text-[11px] min-w-9 px-2 py-1.5 rounded-lg border font-bold text-center transition-all ${sel[0]?.size === s
                                          ? "text-black shadow-sm"
                                          : "text-(--text-secondary) hover:border-(--gold)/60"
                                        }`}
                                        style={sel[0]?.size === s
                                          ? { background: "var(--gold)", borderColor: "var(--gold)" }
                                          : { background: "transparent", borderColor: "var(--border)" }
                                        }
                                      >{s}</button>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Standard size</p>
                              )}
                            </div>

                            {/* Item 2 Size */}
                            <div className="px-3 py-3 space-y-2">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-black" style={{ background: "var(--gold)" }}>2</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: "var(--text-primary)" }}>{p2.name}</span>
                              </div>
                              {sizes2.length > 0 ? (
                                <>
                                  <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Size</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {sizes2.map((s) => (
                                      <button key={s} type="button"
                                        onClick={() => handleSelectionChange(combo._id, 1, "size", s)}
                                        className={`text-[11px] min-w-9 px-2 py-1.5 rounded-lg border font-bold text-center transition-all ${sel[1]?.size === s
                                          ? "text-black shadow-sm"
                                          : "text-(--text-secondary) hover:border-(--gold)/60"
                                        }`}
                                        style={sel[1]?.size === s
                                          ? { background: "var(--gold)", borderColor: "var(--gold)" }
                                          : { background: "transparent", borderColor: "var(--border)" }
                                        }
                                      >{s}</button>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Standard size</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      /* ── SAME COLOR OFF: Fully independent selectors ── */
                      <div className="grid sm:grid-cols-2 gap-5 p-4 sm:p-5 rounded-xl border border-(--border)"
                        style={{ background: "rgba(255,255,255,0.02)" }}>

                        {/* PRODUCT 1 CONTROLS */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-black" style={{ background: "var(--gold)" }}>1</span>
                            <h4 className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: "var(--text-primary)" }}>{p1.name}</h4>
                          </div>
                          {colors1.length > 0 && (
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Color</label>
                              <div className="flex flex-wrap gap-1.5">
                                {colors1.map((c) => (
                                  <button key={c} type="button"
                                    onClick={() => handleSelectionChange(combo._id, 0, "color", c)}
                                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${sel[0]?.color === c
                                      ? "text-black shadow-sm"
                                      : "text-(--text-secondary) hover:border-(--gold)/60"
                                    }`}
                                    style={sel[0]?.color === c
                                      ? { background: "var(--gold)", borderColor: "var(--gold)" }
                                      : { background: "transparent", borderColor: "var(--border)" }
                                    }
                                  >{c}</button>
                                ))}
                              </div>
                            </div>
                          )}
                          {sizes1.length > 0 && (
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Size</label>
                              <div className="flex flex-wrap gap-1.5">
                                {sizes1.map((s) => (
                                  <button key={s} type="button"
                                    onClick={() => handleSelectionChange(combo._id, 0, "size", s)}
                                    className={`text-[11px] min-w-9 px-2 py-1.5 rounded-lg border font-bold text-center transition-all ${sel[0]?.size === s
                                      ? "text-black shadow-sm"
                                      : "text-(--text-secondary) hover:border-(--gold)/60"
                                    }`}
                                    style={sel[0]?.size === s
                                      ? { background: "var(--gold)", borderColor: "var(--gold)" }
                                      : { background: "transparent", borderColor: "var(--border)" }
                                    }
                                  >{s}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* PRODUCT 2 CONTROLS */}
                        <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-(--border) pt-4 sm:pt-0 sm:pl-5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-black" style={{ background: "var(--gold)" }}>2</span>
                            <h4 className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: "var(--text-primary)" }}>{p2.name}</h4>
                          </div>
                          {colors2.length > 0 && (
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Color</label>
                              <div className="flex flex-wrap gap-1.5">
                                {colors2.map((c) => (
                                  <button key={c} type="button"
                                    onClick={() => handleSelectionChange(combo._id, 1, "color", c)}
                                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${sel[1]?.color === c
                                      ? "text-black shadow-sm"
                                      : "text-(--text-secondary) hover:border-(--gold)/60"
                                    }`}
                                    style={sel[1]?.color === c
                                      ? { background: "var(--gold)", borderColor: "var(--gold)" }
                                      : { background: "transparent", borderColor: "var(--border)" }
                                    }
                                  >{c}</button>
                                ))}
                              </div>
                            </div>
                          )}
                          {sizes2.length > 0 && (
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Size</label>
                              <div className="flex flex-wrap gap-1.5">
                                {sizes2.map((s) => (
                                  <button key={s} type="button"
                                    onClick={() => handleSelectionChange(combo._id, 1, "size", s)}
                                    className={`text-[11px] min-w-9 px-2 py-1.5 rounded-lg border font-bold text-center transition-all ${sel[1]?.size === s
                                      ? "text-black shadow-sm"
                                      : "text-(--text-secondary) hover:border-(--gold)/60"
                                    }`}
                                    style={sel[1]?.size === s
                                      ? { background: "var(--gold)", borderColor: "var(--gold)" }
                                      : { background: "transparent", borderColor: "var(--border)" }
                                    }
                                  >{s}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRICE & ADD TO CART CONTAINER */}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Combo Price
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span
                          className="text-2xl sm:text-3xl font-display font-black text-(--gold)"
                          style={{ color: "var(--gold)" }}
                        >
                          Rs. {combo.price?.toLocaleString()}
                        </span>
                        {combo.comparePrice > combo.price && (
                          <span
                            className="line-through text-xs font-medium"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Rs. {combo.comparePrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {combo.comparePrice > combo.price && (
                        <p className="text-[10px] text-green-500 font-bold mt-0.5">
                          You Save Rs.{" "}
                          {(combo.comparePrice - combo.price).toLocaleString()}!
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-xl border border-(--border) bg-black/25 overflow-hidden h-11 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(combo._id, -1)}
                          className="px-3 h-full hover:bg-white/5 transition-colors text-(--text-secondary) flex items-center justify-center"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span
                          className="px-3 font-bold text-sm w-10 text-center"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {sel.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(combo._id, 1)}
                          className="px-3 h-full hover:bg-white/5 transition-colors text-(--text-secondary) flex items-center justify-center"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      {/* Add/Buy Button */}
                      <button
                        type="button"
                        onClick={() => handleAddComboToCart(combo)}
                        className="btn-gold flex-1 sm:flex-initial flex items-center justify-center gap-2 h-11 px-6 text-sm font-bold shadow-lg shadow-(--gold)/10 shrink-0"
                        style={{ minWidth: "160px" }}
                      >
                        <FiShoppingCart size={14} /> Buy Deal
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}