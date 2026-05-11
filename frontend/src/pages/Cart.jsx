import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import { SERVER_URL } from "../services/api";
import { getCartImageUrl } from "../utils/cloudinaryOptimized";
import LazyImage from "../components/LazyImage";

const API_BASE = SERVER_URL;

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const DELIVERY = Number(settings?.deliveryCharges) || 250;
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center gap-6 text-center px-4 pt-20"
        style={{ backgroundColor: "var(--bg-deep)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <FiShoppingCart size={32} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Cart Is Empty</h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Kuch bhi add nahi kiya abhi tak</p>
        <button onClick={() => navigate("/shop")} className="btn-gold">
          <FiShoppingCart size={15} /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden pt-24 pb-16 px-4 sm:px-6"
      style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <p className="section-label mb-1">Your Selection</p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
              Shopping <span className="gold-text">Cart</span>
            </h1>
          </div>
          <button onClick={clearCart}
            className="text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <FiTrash2 size={13} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.cartId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-2xl p-4 sm:p-5 flex gap-3 sm:gap-5"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                >
                  {/* IMAGE */}
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shrink-0"
                    style={{ background: "var(--bg-card)" }}>
                    <LazyImage
                      src={getCartImageUrl(item.images?.[0] || item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate"
                      style={{ color: "var(--text-primary)" }}>{item.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {item.size  && <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}>Size: {item.size}</span>}
                      {item.color && <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}>Color: {item.color}</span>}
                    </div>
                    <div className="flex flex-col mt-1.5">
                      {item.comparePrice > item.price && (
                        <span className="text-[10px] line-through opacity-40 mb-0" style={{ color: "var(--text-muted)" }}>
                          Rs. {item.comparePrice?.toLocaleString()}
                        </span>
                      )}
                      <p className="gold-text font-bold font-display text-base sm:text-lg">
                        Rs. {item.price?.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      {/* QTY */}
                      <div className="flex items-center gap-0 rounded-xl overflow-hidden"
                        style={{ border: "1px solid var(--border)" }}>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="px-2.5 py-2 transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="px-3 font-medium text-sm min-w-7 text-center"
                          style={{ color: "var(--text-primary)" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="px-2.5 py-2 transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="transition-colors p-1"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
              <h2 className="font-display text-xl font-bold mb-5"
                style={{ color: "var(--text-primary)" }}>Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                  <span>Subtotal ({cart.length} items)</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {cart.reduce((s, i) => s + (i.comparePrice > i.price ? (i.comparePrice - i.price) * i.quantity : 0), 0) > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount Savings</span>
                    <span>- Rs. {cart.reduce((s, i) => s + (i.comparePrice > i.price ? (i.comparePrice - i.price) * i.quantity : 0), 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                  <span>Delivery</span>
                  <span>Rs. {DELIVERY}</span>
                </div>
              </div>

              <div className="my-4" style={{ borderTop: "1px solid var(--border)" }} />

              <div className="flex justify-between items-center mb-5">
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Total</span>
                <span className="gold-text font-display text-xl sm:text-2xl font-bold">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="btn-gold w-full"
                style={{ width: "100%" }}
              >
                Proceed to Checkout <FiArrowRight size={15} />
              </button>

              <button
                onClick={() => navigate("/shop")}
                className="mt-3 w-full text-center text-sm transition-colors py-2 flex items-center justify-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <FiArrowLeft size={13} /> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
