import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiTruck, FiCreditCard, FiCheck, FiArrowRight,
  FiMapPin, FiPhone, FiUser, FiTag, FiMail,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";
import api, { SERVER_URL } from "../services/api";

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
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  if (!cart.length) { navigate("/cart"); return null; }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = couponApplied ? COUPON_DISCOUNT : 0;
  const total    = subtotal + DELIVERY - discount;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
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
    <div className="min-h-screen py-8 sm:py-14 px-4 sm:px-6 pt-24 sm:pt-28" style={{ background: "var(--bg-deep)" }}>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <p className="section-label mb-1">Last Step</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>Checkout</h1>
          {/* Guest notice */}
          {!user && (
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              Guest ke tor par order kar rahe hain —{" "}
              <Link to="/login" className="hover:underline" style={{ color: "var(--gold)" }}>Login karo</Link>
              {" "}ya{" "}
              <Link to="/signup" className="hover:underline" style={{ color: "var(--gold)" }}>Sign Up karo</Link>
              {" "}orders track karne ke liye
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ═══ FORMS ═══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* SHIPPING FORM */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 sm:p-7"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <FiMapPin style={{ color: "var(--gold)" }} /> Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* NAME */}
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--text-muted)" }} />
                  <input
                    placeholder="Apna Pura Naam"
                    className="lux-input"
                    style={{ paddingLeft: "40px" }}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>

                {/* PHONE */}
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--text-muted)" }} />
                  <input
                    placeholder="03001234567"
                    className="lux-input"
                    style={{ paddingLeft: "40px" }}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    maxLength={13}
                  />
                </div>

                {/* EMAIL — optional for guest */}
                {!user && (
                  <div className="relative sm:col-span-2">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--text-muted)" }} />
                    <input
                      placeholder="Email (optional — order updates ke liye)"
                      className="lux-input"
                      style={{ paddingLeft: "40px" }}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      type="email"
                    />
                  </div>
                )}

                {/* PROVINCE */}
                <select
                  className="lux-select"
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: "" }))}
                >
                  <option value="">-- Province / State --</option>
                  {Object.keys(pakistanData).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {/* CITY */}
                <select
                  className="lux-select"
                  value={form.city}
                  disabled={!form.province}
                  onChange={(e) => set("city", e.target.value)}
                >
                  <option value="">
                    {!form.province ? "Pehle province choose karo" : "-- Sheher / City --"}
                  </option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <input
                    placeholder="Ghar ka pura address — mohalla, gali, makan number"
                    className="lux-input"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </div>

                {/* POSTAL */}
                <input
                  placeholder="Postal Code (Optional)"
                  className="lux-input"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  maxLength={6}
                />

                {/* NOTE */}
                <div className="sm:col-span-2 rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  📦 Delivery: <span className="font-semibold" style={{ color: "var(--gold)" }}>Rs. {DELIVERY}</span> &nbsp;|&nbsp;
                  🚚 COD available poore Pakistan mein &nbsp;|&nbsp;
                  ⏱️ 2-5 business days
                </div>
              </div>
            </motion.div>

            {/* PAYMENT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 sm:p-7"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <FiCreditCard style={{ color: "var(--gold)" }} /> Payment Method
              </h2>

              <div className="space-y-3">
                {[
                  { id: "COD", icon: <FiTruck />, title: "Cash on Delivery (COD)", desc: "Ghar par milne par payment karo — bilkul safe", available: true },
                  { id: "Card", icon: <FiCreditCard />, title: "Credit / Debit Card", desc: "Coming soon — jald available hoga", available: false },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === opt.id
                        ? "border-[#c9a84c]/50 bg-[rgba(201,168,76,0.05)]"
                        : ""
                    } ${!opt.available ? "opacity-40 cursor-not-allowed" : ""}`}
                    style={paymentMethod !== opt.id ? { border: "1px solid var(--border)" } : {}}>
                    <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id}
                      disabled={!opt.available} onChange={() => opt.available && setPaymentMethod(opt.id)} className="hidden" />
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                      paymentMethod === opt.id ? "border-[#c9a84c] text-[#c9a84c] bg-[rgba(201,168,76,0.1)]" : ""
                    }`} style={paymentMethod !== opt.id ? { border: "1px solid var(--border)", color: "var(--text-muted)" } : {}}>
                      {paymentMethod === opt.id ? <FiCheck /> : opt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{opt.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{opt.desc}</div>
                    </div>
                    {opt.id === "COD" && <span className="text-xs gold-gradient text-black px-2 py-0.5 rounded font-bold">Recommended</span>}
                  </label>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ═══ ORDER SUMMARY ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="rounded-2xl p-5 sm:p-6 sticky top-24" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
              <h2 className="font-display text-xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>Order Summary</h2>

              {/* CART ITEMS */}
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <img
                        src={`${SERVER_URL}${item.images?.[0] || ""}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
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

              {/* COUPON — Only for logged-in users */}
              {user ? (
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={12} />
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
                    className={`text-xs font-semibold px-4 rounded-xl border transition-all disabled:opacity-40 ${
                      couponApplied ? "gold-gradient text-black border-transparent" : "border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[rgba(201,168,76,0.08)]"
                    }`}
                    style={{ padding: "10px 14px", fontSize: "0.78rem", whiteSpace: "nowrap" }}
                  >
                    {couponApplied ? <FiCheck size={14} /> : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl text-xs text-center" style={{ background: "rgba(201, 168, 76, 0.1)", border: "1px solid rgba(201, 168, 76, 0.3)", color: "var(--text-muted)" }}>
                  <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--gold)" }}>Login</Link> ya <Link to="/signup" className="font-semibold hover:underline" style={{ color: "var(--gold)" }}>Sign Up</Link> karke coupon apply karo
                </div>
              )}

              {/* PRICE BREAKDOWN */}
              <div className="pt-4 space-y-2.5 text-sm" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                  <span>Items Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                  <span>Delivery Charges</span>
                  <span>Rs. {DELIVERY}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon ({COUPON_CODE})</span>
                    <span>- Rs. {COUPON_DISCOUNT.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="my-4" style={{ borderTop: "1px solid var(--border)" }} />
              <div className="flex justify-between items-center mb-5">
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Total Payable</span>
                <span className="gold-text font-display text-2xl font-bold">Rs. {total.toLocaleString()}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="btn-gold w-full disabled:opacity-60"
                style={{ width: "100%", padding: "16px" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Order ho raha hai...
                  </span>
                ) : (
                  <>Confirm Order <FiArrowRight /></>
                )}
              </button>

              <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>🔒 Secure &amp; Safe Checkout</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
