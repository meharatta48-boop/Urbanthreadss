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
        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-opacity-10 bg-gray-500"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <FiShoppingCart size={40} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Cart Is Empty</h2>
          <p className="text-sm opacity-70" style={{ color: "var(--text-muted)" }}>Kuch bhi add nahi kiya abhi tak</p>
        </div>
        <button 
          onClick={() => navigate("/shop")} 
          className="btn-gold px-8 py-3 rounded-full flex items-center gap-2 transition-transform active:scale-95"
        >
          <FiShoppingCart size={18} /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 sm:pb-16 px-4 sm:px-6"
      style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="max-w-6xl mx-auto">

        {/* HEADER - Mobile Optimized */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label text-xs uppercase tracking-widest opacity-70 mb-1">Your Selection</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
              Shopping <span className="gold-text">Cart</span>
            </h1>
          </div>
          <button 
            onClick={clearCart}
            className="text-xs font-medium flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity pb-1"
            style={{ color: "var(--text-muted)" }}
          >
            <FiTrash2 size={14} /> <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode='popLayout'>
              {cart.map((item) => (
                <motion.div
                  key={item.cartId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="cart-item relative flex gap-3 p-3 sm:p-4 rounded-2xl border border-(--border-light)"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                >
                  {/* IMAGE - Responsive Size */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-black/20">
                    <LazyImage
                      src={getCartImageUrl(item.images?.[0] || item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex flex-col justify-between grow py-1">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold line-clamp-1" style={{ color: "var(--text-primary)" }}>
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.size  && <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-(--text-muted)">Size: {item.size}</span>}
                        {item.color && <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-(--text-muted)">Color: {item.color}</span>}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="flex flex-col">
                        {item.comparePrice > item.price && (
                          <span className="text-[10px] sm:text-xs line-through opacity-50">
                            Rs. {item.comparePrice?.toLocaleString()}
                          </span>
                        )}
                        <span className="text-sm sm:text-lg font-bold gold-text">
                          Rs. {item.price?.toLocaleString()}
                        </span>
                      </div>

                      {/* QUANTITY CONTROLS - Better Touch Targets */}
                      <div className="flex items-center bg-black/20 rounded-lg border border-white/10 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="p-2 hover:bg-white/5 transition-colors"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="p-2 hover:bg-white/5 transition-colors"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ABSOLUTE REMOVE FOR CLEANER UX */}
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="absolute top-2 right-2 p-2 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* SUMMARY - Mobile Sticky Support */}
          <div className="lg:col-span-1">
            <div className="cart-summary sticky top-24 p-6 rounded-2xl border border-(--border-light) bg-white/2">
              <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm opacity-80">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm opacity-80">
                  <span>Delivery</span>
                  <span>Rs. {DELIVERY.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold gold-text">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Desktop Buttons */}
              <div className="hidden sm:flex flex-col gap-3">
                <Link to="/checkout" className="btn-gold w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-gold/20">
                  Proceed to Checkout <FiArrowRight />
                </Link>
                <Link to="/shop" className="text-center text-sm opacity-60 hover:opacity-100 transition-opacity">
                  Continue Shopping
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3 text-[11px] opacity-50 uppercase tracking-wider">
                  <FiTruck size={16} className="gold-text" />
                  <span>Free delivery above Rs. 5000</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] opacity-50 uppercase tracking-wider">
                  <FiShield size={16} className="gold-text" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING ACTION BAR - This is huge for UX */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-(--bg-deep) border-t border-white/10 sm:hidden z-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-60 uppercase">Total Amount</span>
            <span className="text-lg font-bold gold-text leading-none">Rs. {total.toLocaleString()}</span>
          </div>
          <Link to="/checkout" className="btn-gold grow py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl">
            Checkout <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}