import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiTruck, FiCreditCard, FiCheck, FiArrowRight,
  FiMapPin, FiPhone, FiUser, FiTag, FiMail, FiShield, FiLoader,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";
import { SERVER_URL } from "../services/api";
import { getCartImageUrl } from "../utils/cloudinaryOptimized";
import LazyImage from "../components/LazyImage";
import { metaTracker } from "../utils/metaTracking";

/* ─── ALL PAKISTAN CITIES (100+) ─── */
const pakistanData = {
  Punjab: [
    "Lahore", "Rawalpindi", "Faisalabad", "Gujranwala", "Multan",
    "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura", "Jhang",
    "Rahim Yar Khan", "Gujrat", "Kasur", "Sahiwal", "Okara",
    "Wazirabad", "Chiniot", "Hafizabad", "Muzaffargarh", "Khanewal",
    "Mandi Bahauddin", "Chakwal", "Jhelum", "Attock", "Narowal",
    "Pakpattan", "Vehari", "Lodhran", "Mianwali", "Bhakkar",
    "Khushab", "Layyah", "Toba Tek Singh", "Nankana Sahib",
    "Muridke", "Kamoke", "Daska", "Sambrial", "Renala Khurd",
    "Burewala", "Jaranwala", "Chunian", "Pattoki",
  ],
  Sindh: [
    "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah",
    "Mirpur Khas", "Khairpur", "Jacobabad", "Shikarpur", "Dadu",
    "Umerkot", "Sanghar", "Thatta", "Matiari", "Badin",
    "Tando Adam", "Tando Allahyar", "Kotri", "Hala", "Ghotki",
    "Kashmore", "Kandhkot", "Sehwan", "Jamshoro", "Qambar",
  ],
  KPK: [
    "Peshawar", "Mardan", "Abbottabad", "Swat", "Nowshera",
    "Mansehra", "Charsadda", "Kohat", "Bannu", "Dera Ismail Khan",
    "Swabi", "Haripur", "Buner", "Dir", "Chitral",
    "Malakand", "Batagram", "Shangla", "Hangu", "Lakki Marwat",
    "Tank", "Karak", "Torghar", "Kohistan",
  ],
  Balochistan: [
    "Quetta", "Gwadar", "Khuzdar", "Chaman", "Turbat",
    "Hub", "Dera Bugti", "Zhob", "Loralai", "Kalat",
    "Mastung", "Nushki", "Panjgur", "Pasni", "Ormara",
    "Kharan", "Awaran", "Kech", "Washuk",
  ],
  "Azad Kashmir": [
    "Muzaffarabad", "Mirpur", "Rawalakot", "Kotli", "Bagh",
    "Haveli", "Neelum", "Poonch", "Bhimber", "Sudhnoti",
  ],
  "Gilgit Baltistan": [
    "Gilgit", "Skardu", "Hunza", "Ghanche", "Ghizer",
    "Nagar", "Diamer", "Astore", "Shigar",
  ],
  Islamabad: ["Islamabad"],
};

const API_BASE = SERVER_URL + "/api";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { token, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const DELIVERY        = settings?.deliveryCharges ?? 250;
  const COUPON_CODE     = settings?.couponCode     || "SAVE10";
  const COUPON_DISCOUNT = settings?.couponDiscount ?? 500;

  const [coupon, setCoupon]             = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading]           = useState(false);

  const STORAGE_KEY = "ut_checkout_form";
  const [form, setForm] = useState(() => {
    const defaults = {
      name:       user?.name  || "",
      phone:      user?.phone || "",
      email:      user?.email || "",
      province:   "",
      city:       "",
      address:    "",
      postalCode: "",
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch (err) { console.error("Storage error:", err); }
  }, [form]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = couponApplied ? COUPON_DISCOUNT : 0;
  const total    = subtotal + DELIVERY - discount;

  useEffect(() => {
    if (cart.length > 0) {
      metaTracker.trackInitiateCheckout(cart, subtotal + DELIVERY);
    }
  }, [cart, subtotal, DELIVERY]);

  if (!cart.length) {
    navigate("/cart");
    return null;
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);
  const handleSubmit = (e) => { e.preventDefault(); placeOrder(); };

  const applyCoupon = () => {
    if (!user) { 
      toast.error("Coupon sirf login ke baad available hai");
      return;
    }
    if (couponApplied) { toast.info("Coupon already applied"); return; }
    if (coupon.trim().toUpperCase() === COUPON_CODE.toUpperCase()) {
      setCouponApplied(true);
      toast.success(`Code "${COUPON_CODE}" apply ho gaya! Rs. ${COUPON_DISCOUNT.toLocaleString()} ki bachat 🎉`);
    } else {
      toast.error("Galat coupon code — dobara check karo");
    }
  };

  const validate = () => {
    if (!form.name.trim())  { toast.error("Naam likhna zaroori hai");    return false; }
    if (!form.phone.trim()) { toast.error("Phone number likhna zaroori hai"); return false; }
    const phoneOk = /^(((\+92)?(0092)?(92)?(0)?)(3\d{9}))$/.test(form.phone.replace(/\s|-/g, ""));
    if (!phoneOk) { toast.error("Valid Pakistani number daalo (e.g. 03001234567)"); return false; }
    if (!form.province)     { toast.error("Province select karo");       return false; }
    if (!form.city)         { toast.error("City select karo");            return false; }
    if (!form.address.trim()) { toast.error("Address likhna zaroori hai"); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`; // attach if logged in

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderItems: cart.map((i) => ({
            product:  i._id,
            quantity: i.quantity,
            size:     i.size  || "",
            color:    i.color || "",
          })),
          shippingAddress: {
            fullName:   form.name,
            address:    form.address,
            city:       form.city,
            province:   form.province,
            postalCode: form.postalCode || "00000",
            phone:      form.phone,
            country:    "Pakistan",
          },
          paymentMethod,
          itemsPrice:     subtotal,
          shippingPrice:  DELIVERY,
          totalPrice:     total,
          couponCode:     couponApplied ? COUPON_CODE : "",
          couponDiscount: couponApplied ? COUPON_DISCOUNT : 0,
          // Guest info (ignored if user logged in)
          guestName:  form.name,
          guestEmail: form.email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        try { localStorage.removeItem(STORAGE_KEY); } catch (err) { console.error("Remove storage error:", err); }
        toast.success("🎉 Order place ho gaya! Jald delivery hogi.");
        navigate("/order-success", {
          replace: true,
          state: {
            orderId:  data.order._id,
            total:    total,
            isGuest:  !user,
            name:     form.name,
          },
        });
      } else {
        toast.error(data.message || "Order nahi ho saka");
      }
    } catch {
      toast.error("Server error. Thodi der baad try karo.");
    } finally {
      setLoading(false);
    }
  };

  const cities = form.province ? (pakistanData[form.province] || []) : [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <div className="max-w-6xl mx-auto">
        {/* PAGE HEADER */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="section-label mb-2">Final Step</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
              Secure <span className="gold-text">Checkout</span>
            </h1>
          </motion.div>
        </div>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8">
          {/* MAIN FORM */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* SHIPPING INFORMATION */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <div className="checkout-section-icon">
                    <FiMapPin size={20} />
                  </div>
                  <span>Shipping Information</span>
                </div>
                
                <div className="checkout-form-grid">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="lux-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="lux-input"
                      placeholder="03xx-xxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="lux-input"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      className="lux-input"
                      placeholder="00000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Province *</label>
                    <select
                      name="province"
                      value={form.province}
                      onChange={(e) => { set("province", e.target.value); set("city", ""); }}
                      required
                      className="lux-select"
                    >
                      <option value="">Select Province</option>
                      {Object.keys(pakistanData).map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>City *</label>
                    <select
                      name="city"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      required
                      disabled={!form.province}
                      className="lux-select"
                    >
                      <option value="">Select City</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="checkout-form-col-full">
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Complete Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="lux-input"
                      placeholder="Street, House No., Area"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <div className="checkout-section-icon">
                    <FiCreditCard size={20} />
                  </div>
                  <span>Payment Method</span>
                </div>
                
                <div className="checkout-payment-methods">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`checkout-payment-method ${paymentMethod === "COD" ? "active" : ""}`}
                  >
                    <FiTruck size={20} className="mb-2" />
                    Cash on Delivery
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BANK")}
                    className={`checkout-payment-method ${paymentMethod === "BANK" ? "active" : ""}`}
                  >
                    <FiCreditCard size={20} className="mb-2" />
                    Bank Transfer
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="btn-gold w-full animate-slide-up"
                  style={{ padding: "18px 24px", fontSize: "1.1rem" }}
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck size={20} />
                      Place Order • Rs. {total.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="cart-summary">
              <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Order Summary</h3>
              
              {/* CART ITEMS */}
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <LazyImage
                        src={getCartImageUrl(item.images?.[0] || item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{[item.size, item.color].filter(Boolean).join(" · ")}</p>
                      )}
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>x{item.quantity}</p>
                    </div>
                    <span className="text-xs whitespace-nowrap font-medium" style={{ color: "var(--text-secondary)" }}>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* COUPON */}
              {user ? (
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: "var(--text-muted)" }} />
                    <input
                      placeholder="Coupon code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      className="lux-input text-sm"
                      style={{ padding: "10px 12px 10px 32px", fontSize: "0.82rem" }}
                      disabled={couponApplied}
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={!coupon.trim() || couponApplied}
                    className="btn-outline text-xs px-4"
                  >
                    Apply
                  </button>
                </div>
              ) : null}

              {/* SUMMARY ROWS */}
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">Rs. {subtotal.toLocaleString()}</span>
              </div>
              
              {couponApplied && (
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Discount</span>
                  <span className="cart-summary-value" style={{ color: "#10b981" }}>-Rs. {COUPON_DISCOUNT}</span>
                </div>
              )}
              
              <div className="cart-summary-row">
                <span className="cart-summary-label">Delivery</span>
                <span className="cart-summary-value">Rs. {DELIVERY.toLocaleString()}</span>
              </div>
              
              <div className="cart-summary-row cart-summary-total">
                <span className="cart-summary-label">Total</span>
                <span className="cart-summary-value">Rs. {total.toLocaleString()}</span>
              </div>
              
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-(--text-muted) mb-2">
                  <FiTruck size={12} />
                  <span>2-5 business days delivery</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-(--text-muted)">
                  <FiShield size={12} />
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
