import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingCart, FiTag, FiLoader, FiPlus, FiMinus, FiCheckCircle } from "react-icons/fi";
import api, { SERVER_URL } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import LazyImage from "../LazyImage";
import { getCartImageUrl } from "../../utils/cloudinaryOptimized";

export default function ComboOffers() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState({}); // { comboId: { product1: { color, size }, product2: { color, size }, quantity } }
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/combos")
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
            const colors1 = p1.colors?.length ? p1.colors : (p1.product?.colors || []);
            const sizes1 = p1.sizes?.length ? p1.sizes : (p1.product?.sizes || []);
            const colors2 = p2.colors?.length ? p2.colors : (p2.product?.colors || []);
            const sizes2 = p2.sizes?.length ? p2.sizes : (p2.product?.sizes || []);

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
      })
      .catch((err) => {
        console.error("Error fetching combos:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectionChange = (comboId, productIndex, key, value) => {
    setSelections((prev) => ({
      ...prev,
      [comboId]: {
        ...prev[comboId],
        [productIndex]: {
          ...prev[comboId]?.[productIndex],
          [key]: value,
        },
      },
    }));
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
      images: combo.images?.length ? combo.images : [p1.images?.[0], p2.images?.[0]].filter(Boolean),
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
        <p className="text-(--text-muted) text-sm mt-3">Loading premium combo offers...</p>
      </div>
    );
  }

  if (!combos.length) return null;

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* BACKGROUND SHADOW GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-(--gold)/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="section-label mb-2 inline-flex items-center gap-1.5 bg-(--gold)/10 px-3 py-1 rounded-full text-xs font-semibold text-(--gold)">
              <FiTag size={12} /> Special Promotion
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              Mix & Match <span className="gold-text">Combo Offers</span>
            </h2>
            <p className="text-sm max-w-lg mx-auto mt-3" style={{ color: "var(--text-secondary)" }}>
              Double the style, double the savings. Customize your favorite colors and sizes together in a discounted package!
            </p>
          </motion.div>
        </div>

        {/* COMBOS GRID */}
        <div className="space-y-12 sm:space-y-16">
          {combos.map((combo, idx) => {
            const p1 = combo.products[0]?.product;
            const p2 = combo.products[1]?.product;
            if (!p1 || !p2) return null;

            const sel = selections[combo._id] || { 0: {}, 1: {}, quantity: 1 };
            const discountPercent = combo.comparePrice > combo.price 
              ? Math.round(((combo.comparePrice - combo.price) / combo.comparePrice) * 100)
              : 0;

            // Resolve variants (prefer custom combo limits, fallback to product data)
            const colors1 = combo.products[0].colors?.length ? combo.products[0].colors : (p1.colors || []);
            const sizes1 = combo.products[0].sizes?.length ? combo.products[0].sizes : (p1.sizes || []);
            const colors2 = combo.products[1].colors?.length ? combo.products[1].colors : (p2.colors || []);
            const sizes2 = combo.products[1].sizes?.length ? combo.products[1].sizes : (p2.sizes || []);

            return (
              <motion.div
                key={combo._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="grid lg:grid-cols-12 gap-8 items-center bg-(--bg-surface) p-6 sm:p-10 rounded-2xl border border-(--border) shadow-xl relative overflow-hidden"
              >
                {/* COMBO DISCOUNT BADGE */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Save {discountPercent}%
                  </div>
                )}

                {/* IMAGES SIDE BY SIDE (lg:col-span-5) */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                  {/* PRODUCT 1 / COMBO IMAGE 1 */}
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] border border-(--border) group bg-black/10">
                    <LazyImage
                      src={getCartImageUrl(combo.images?.[0] || p1.images?.[0])}
                      alt={p1.name}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                      <span className="text-[10px] text-(--gold) font-bold tracking-widest uppercase">
                        {combo.images?.[0] ? "Promo Item 1" : "Item #1"}
                      </span>
                      <p className="text-white text-xs font-semibold truncate">{p1.name}</p>
                    </div>
                  </div>

                  {/* PRODUCT 2 / COMBO IMAGE 2 */}
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] border border-(--border) group bg-black/10">
                    <LazyImage
                      src={getCartImageUrl(combo.images?.[1] || p2.images?.[0])}
                      alt={p2.name}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                      <span className="text-[10px] text-(--gold) font-bold tracking-widest uppercase">
                        {combo.images?.[1] ? "Promo Item 2" : "Item #2"}
                      </span>
                      <p className="text-white text-xs font-semibold truncate">{p2.name}</p>
                    </div>
                  </div>
                </div>

                {/* PLUS CONNECTOR ICON FOR VISUAL FLUSH */}
                <div className="hidden lg:flex absolute left-[39%] top-1/2 -translate-y-1/2 bg-(--gold) w-8 h-8 rounded-full items-center justify-center text-black font-extrabold border border-black z-20 shadow-md">
                  +
                </div>

                {/* SELECTORS & INFO (lg:col-span-7) */}
                <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6 lg:pl-4">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {combo.name}
                    </h3>
                    {combo.description && (
                      <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                        {combo.description}
                      </p>
                    )}
                  </div>

                  {/* VARIANT CONTROLS */}
                  <div className="grid sm:grid-cols-2 gap-6 p-4 rounded-xl border border-(--border)" style={{ background: "rgba(255,255,255,0.01)" }}>
                    {/* PRODUCT 1 CONTROLS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-(--gold)/20 border border-(--gold)/40 flex items-center justify-center text-[10px] font-bold text-(--gold)">1</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>{p1.name}</h4>
                      </div>

                      {/* Product 1 Color */}
                      {colors1.length > 0 && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Select Color</label>
                          <div className="flex flex-wrap gap-1.5">
                            {colors1.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleSelectionChange(combo._id, 0, "color", c)}
                                className={`text-[10px] px-2.5 py-1 rounded border font-semibold transition-all ${
                                  sel[0].color === c
                                    ? "bg-(--gold) text-black border-(--gold) shadow-sm"
                                    : "bg-transparent text-(--text-secondary) border-(--border) hover:border-(--text-secondary)"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product 1 Size */}
                      {sizes1.length > 0 && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Select Size</label>
                          <div className="flex flex-wrap gap-1.5">
                            {sizes1.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleSelectionChange(combo._id, 0, "size", s)}
                                className={`text-[10px] min-w-8 px-2 py-1 rounded border font-bold text-center transition-all ${
                                  sel[0].size === s
                                    ? "bg-(--gold) text-black border-(--gold) shadow-sm"
                                    : "bg-transparent text-(--text-secondary) border-(--border) hover:border-(--text-secondary)"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PRODUCT 2 CONTROLS */}
                    <div className="space-y-4 border-t sm:border-t-0 sm:border-l border-(--border) pt-4 sm:pt-0 sm:pl-6">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-(--gold)/20 border border-(--gold)/40 flex items-center justify-center text-[10px] font-bold text-(--gold)">2</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>{p2.name}</h4>
                      </div>

                      {/* Product 2 Color */}
                      {colors2.length > 0 && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Select Color</label>
                          <div className="flex flex-wrap gap-1.5">
                            {colors2.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleSelectionChange(combo._id, 1, "color", c)}
                                className={`text-[10px] px-2.5 py-1 rounded border font-semibold transition-all ${
                                  sel[1].color === c
                                    ? "bg-(--gold) text-black border-(--gold) shadow-sm"
                                    : "bg-transparent text-(--text-secondary) border-(--border) hover:border-(--text-secondary)"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product 2 Size */}
                      {sizes2.length > 0 && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Select Size</label>
                          <div className="flex flex-wrap gap-1.5">
                            {sizes2.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleSelectionChange(combo._id, 1, "size", s)}
                                className={`text-[10px] min-w-8 px-2 py-1 rounded border font-bold text-center transition-all ${
                                  sel[1].size === s
                                    ? "bg-(--gold) text-black border-(--gold) shadow-sm"
                                    : "bg-transparent text-(--text-secondary) border-(--border) hover:border-(--text-secondary)"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PRICE & ADD TO CART CONTAINER */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-(--border)">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Combo Price</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl sm:text-3xl font-display font-black text-(--gold)" style={{ color: "var(--gold)" }}>
                          Rs. {combo.price?.toLocaleString()}
                        </span>
                        {combo.comparePrice > combo.price && (
                          <span className="line-through text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                            Rs. {combo.comparePrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {combo.comparePrice > combo.price && (
                        <p className="text-[10px] text-green-500 font-bold mt-0.5">
                          You Save Rs. {(combo.comparePrice - combo.price).toLocaleString()}!
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-xl border border-(--border) bg-black/25 overflow-hidden h-11">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(combo._id, -1)}
                          className="px-3 h-full hover:bg-white/5 transition-colors text-(--text-secondary) flex items-center justify-center"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="px-4 font-bold text-sm w-12 text-center" style={{ color: "var(--text-primary)" }}>
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
                        className="btn-gold flex-1 sm:flex-initial flex items-center justify-center gap-2 h-11 px-6 text-sm font-bold shadow-lg shadow-(--gold)/10"
                        style={{ minWidth: "160px" }}
                      >
                        <FiShoppingCart size={14} /> Buy Combo Deal
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
