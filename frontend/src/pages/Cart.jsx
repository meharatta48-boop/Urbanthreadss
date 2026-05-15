import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingCart, FiTruck, FiShield } from "react-icons/fi";
import { SERVER_URL } from "../services/api";
import { getCartImageUrl } from "../utils/cloudinaryOptimized";
import LazyImage from "../components/LazyImage";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const DELIVERY = Number(settings?.deliveryCharges) || 250;
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6 pt-20"
        style={{ backgroundColor: "var(--bg-deep)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-(--text-muted)">
          <FiShoppingCart size={32} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Cart Is Empty</h2>
          <p className="text-sm opacity-50" style={{ color: "var(--text-muted)" }}>Abhi tak koi item add nahi kiya gaya.</p>
        </div>
        <button
          onClick={() => navigate("/shop")}
          className="btn-gold px-8 py-3 rounded-full flex items-center gap-2 text-sm font-bold transition-transform active:scale-95"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-28 sm:pb-20 px-4 sm:px-6"
      style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">Review Items</p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
              Shopping <span className="gold-text">Cart</span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs font-medium text-red-400/70 hover:text-red-400 transition-colors pb-1"
          >
            <FiTrash2 size={14} /> <span>Clear All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item.cartId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors items-stretch"
                >
                  {/* INDIVIDUAL DELETE BUTTON - Fixed positioning & improved visibility */}
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="absolute top-3 right-3 p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all z-10"
                    title="Remove item"
                  >
                    <FiTrash2 size={18} />
                  </button>

                  {/* IMAGE - Fixed square container to fit perfectly */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/5 aspect-square">
                    <LazyImage
                      src={getCartImageUrl(item.images?.[0] || item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex flex-col justify-between grow min-w-0 pr-8">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold truncate pr-2" style={{ color: "var(--text-primary)" }}>
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {item.size && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 border border-white/5 opacity-60">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 border border-white/5 opacity-60">
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-bold gold-text">
                          Rs. {item.price?.toLocaleString()}
                        </span>
                        {item.comparePrice > item.price && (
                          <span className="text-[10px] sm:text-xs line-through opacity-30">
                            Rs. {item.comparePrice?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* QUANTITY */}
                      <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={12} className={item.quantity <= 1 ? "opacity-20" : "opacity-100"} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-white/5 bg-white/3 p-6 backdrop-blur-md shadow-2xl">
              <h3 className="text-lg font-bold mb-6 text-(--text-primary)">Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm opacity-60">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm opacity-60">
                  <span>Delivery</span>
                  <span>Rs. {DELIVERY.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold gold-text">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden sm:block space-y-3">
                <Link to="/checkout" className="btn-gold w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-gold/10">
                  Checkout Now <FiArrowRight />
                </Link>
                <button onClick={() => navigate("/shop")} className="w-full text-xs opacity-40 hover:opacity-100 transition-opacity">
                  Continue Shopping
                </button>
              </div>

              {/* Badges */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3 text-[10px] opacity-40 uppercase tracking-widest">
                  <FiTruck size={16} className="gold-text" />
                  <span>Express Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] opacity-40 uppercase tracking-widest">
                  <FiShield size={16} className="gold-text" />
                  <span>Secure Payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-(--bg-deep)/90 backdrop-blur-xl border-t border-white/10 sm:hidden z-50 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Total Payable</span>
            <span className="text-xl font-bold gold-text leading-tight">Rs. {total.toLocaleString()}</span>
          </div>
          <Link to="/checkout" className="btn-gold grow py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl transition-transform active:scale-95">
            Checkout <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}