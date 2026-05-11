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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4 pt-20"
        style={{ backgroundColor: "var(--bg-deep)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <FiShoppingCart size={32} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Cart Is Empty</h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Kuch bhi add nahi kiya abhi tak</p>
        <button 
          onClick={() => navigate("/shop")} 
          className="btn-gold"
          style={{ minHeight: '44px' }}
        >
          <FiShoppingCart size={15} /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6"
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
          <button 
            onClick={clearCart}
            className="text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            style={{ color: "var(--text-muted)", minHeight: '32px' }}
            onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <FiTrash2 size={13} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.cartId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="cart-item flex gap-4"
                >
                  {/* IMAGE */}
                  <div className="cart-item-image">
                    <LazyImage
                      src={getCartImageUrl(item.images?.[0] || item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-variants">
                      {item.size  && <span className="cart-item-variant">Size: {item.size}</span>}
                      {item.color && <span className="cart-item-variant">Color: {item.color}</span>}
                    </div>
                    <div className="cart-item-price">
                      <div className="flex flex-col">
                        {item.comparePrice > item.price && (
                          <span className="cart-item-price-original">
                            Rs. {item.comparePrice?.toLocaleString()}
                          </span>
                        )}
                        <span className="cart-item-price-current">
                          Rs. {item.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="cart-item-actions">
                    <div className="cart-quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="cart-quantity-btn"
                      >
                        <FiMinus size={14} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.cartId, Math.max(1, parseInt(e.target.value) || 1))}
                        className="cart-quantity-input"
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="cart-quantity-btn"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="cart-remove-btn"
                    >
                      <FiTrash2 size={12} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-1">
            <div className="cart-summary">
              <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Order Summary</h3>
              
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">Rs. {subtotal.toLocaleString()}</span>
              </div>
              
              <div className="cart-summary-row">
                <span className="cart-summary-label">Delivery</span>
                <span className="cart-summary-value">Rs. {DELIVERY.toLocaleString()}</span>
              </div>
              
              <div className="cart-summary-row cart-summary-total">
                <span className="cart-summary-label">Total</span>
                <span className="cart-summary-value">Rs. {total.toLocaleString()}</span>
              </div>
              
              <div className="mt-6 space-y-3">
                <Link to="/checkout" className="btn-gold w-full animate-slide-up">
                  <FiArrowRight size={16} /> Proceed to Checkout
                </Link>
                <Link to="/shop" className="btn-outline w-full">
                  <FiShoppingCart size={16} /> Continue Shopping
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-(--border-light)">
                <div className="flex items-center gap-2 text-xs text-(--text-muted) mb-3">
                  <FiTruck size={14} />
                  <span>Free delivery on orders above Rs. 5000</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                  <FiShield size={14} />
                  <span>Secure payment guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
