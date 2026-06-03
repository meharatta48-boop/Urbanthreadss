import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiTag, FiPlus, FiTrash2, FiZap, FiTruck,
  FiShoppingBag, FiMail, FiLayers, FiDollarSign, FiClock, FiSettings, FiCheckCircle
} from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function MarketingCenter() {
  const [activeTab, setActiveTab] = useState("coupons");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "fixed",
    discountValue: "",
    minOrderValue: "0",
    endDate: "",
    isActive: true,
    usageLimit: ""
  });
  
  // Flash Sales State
  const [flashSale, setFlashSale] = useState({
    isActive: false,
    discountPercent: 15,
    endsAt: "",
    tagline: "Midnight Madness Drop"
  });

  // Free Shipping State
  const [freeShipping, setFreeShipping] = useState({
    enabled: true,
    minOrderValue: 2000
  });

  // Abandoned Carts State
  const [abandonedCarts, setAbandonedCarts] = useState([
    { id: "1", customer: "Zain Ali", email: "zain.ali@example.com", items: 2, total: 3900, time: "2 hours ago" },
    { id: "2", customer: "Ayesha Khan", email: "ayesha.k@example.com", items: 1, total: 2450, time: "5 hours ago" },
    { id: "3", customer: "Bilal Ahmed", email: "bilal.a@example.com", items: 3, total: 7200, time: "1 day ago" }
  ]);

  // Upsells State
  const [upsells, setUpsells] = useState([
    { id: "1", triggerCategory: "T-Shirts", offerCategory: "Hoodies", discount: 10, isActive: true }
  ]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get("/coupons");
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "coupons") {
      loadCoupons();
    }
  }, [activeTab]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue || !form.endDate) {
      return toast.warning("Please fill all required fields");
    }
    try {
      const res = await api.post("/coupons", form);
      if (res.data.success) {
        toast.success("Coupon created successfully!");
        setForm({
          code: "",
          discountType: "fixed",
          discountValue: "",
          minOrderValue: "0",
          endDate: "",
          isActive: true,
          usageLimit: ""
        });
        loadCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.data.success) {
        toast.success("Coupon deleted successfully");
        loadCoupons();
      }
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const handleRecoverCart = (cart) => {
    toast.success(`Recovery email sent to ${cart.email}!`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-950/20 to-slate-900/10 border border-purple-900/20 p-6 rounded-2xl">
        <p className="text-[10px] font-bold tracking-wider text-purple-400 uppercase mb-0.5">Campaign Control Room</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">Marketing Center</h2>
        <p className="text-(--text-muted) text-xs mt-1">Manage discount rules, scheduling, flash promotions, and upsell configurations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border)">
        {[
          { id: "coupons", label: "Coupons", icon: <FiTag /> },
          { id: "flash", label: "Flash Sales", icon: <FiZap /> },
          { id: "shipping", label: "Free Shipping", icon: <FiTruck /> },
          { id: "abandoned", label: "Cart Recovery", icon: <FiShoppingBag /> },
          { id: "upsells", label: "Upsell rules", icon: <FiLayers /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === t.id
                ? "border-(--gold) text-(--gold) bg-(--gold)/5"
                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl"
        >
          {/* TAB 1: Coupons */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <form onSubmit={handleCreateCoupon} className="lg:col-span-1 space-y-4 bg-(--bg-elevated)/30 p-4 rounded-xl border border-(--border)/40">
                  <h4 className="text-sm font-bold text-(--text-primary) border-b border-(--border)/50 pb-2">Add New Coupon</h4>
                  
                  <div>
                    <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Coupon Code *</label>
                    <input
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="e.g. SUMMER500"
                      className="lux-input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Type</label>
                      <select
                        value={form.discountType}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="lux-input w-full"
                      >
                        <option value="fixed">Fixed (Rs)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Discount Value *</label>
                      <input
                        required
                        type="number"
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        placeholder="500"
                        className="lux-input w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Min Order (Rs)</label>
                      <input
                        type="number"
                        value={form.minOrderValue}
                        onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                        placeholder="0"
                        className="lux-input w-full"
                      />
                    </div>
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Usage Limit</label>
                      <input
                        type="number"
                        value={form.usageLimit}
                        onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                        placeholder="Unlimited"
                        className="lux-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Expiry Date *</label>
                    <input
                      required
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="lux-input w-full"
                    />
                  </div>

                  <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
                    <FiPlus /> Save Coupon
                  </button>
                </form>

                {/* List */}
                <div className="lg:col-span-2 space-y-3">
                  <h4 className="text-sm font-bold text-(--text-primary)">Active Promotions</h4>
                  {loading ? (
                    <div className="p-12 text-center text-xs text-(--text-muted)">Loading coupons...</div>
                  ) : coupons.length === 0 ? (
                    <div className="p-12 text-center text-xs text-(--text-muted) border border-dashed border-(--border) rounded-xl">No custom coupons created yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {coupons.map((coupon) => (
                        <div key={coupon._id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-(--gold)/10 text-(--gold) border border-(--gold)/20 px-2 py-0.5 rounded">
                                {coupon.code}
                              </span>
                              {!coupon.isActive && <span className="text-[9px] bg-red-500/10 text-red-400 px-1 rounded">Disabled</span>}
                            </div>
                            <p className="text-xs font-semibold text-(--text-primary) mt-2">
                              {coupon.discountType === "percentage" ? `${coupon.discountValue}% Off` : `Rs. ${coupon.discountValue.toLocaleString()} Off`}
                            </p>
                            <p className="text-[10px] text-(--text-muted) mt-1">Min Order: Rs. {coupon.minOrderValue || 0}</p>
                            <p className="text-[10px] text-(--text-muted)">Expires: {new Date(coupon.endDate).toLocaleDateString()}</p>
                            <p className="text-[10px] text-(--gold) font-semibold mt-1">Used: {coupon.usageCount} times</p>
                          </div>
                          <button onClick={() => handleDeleteCoupon(coupon._id)} className="text-red-400 hover:text-red-300 p-1">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Flash Sales */}
          {activeTab === "flash" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-(--border)/50 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-(--text-primary)">Storewide Flash Sale Promos</h4>
                  <p className="text-xs text-(--text-muted)">Configure timers and instant discount tags across products.</p>
                </div>
                <button
                  onClick={() => setFlashSale({ ...flashSale, isActive: !flashSale.isActive })}
                  className="w-12 h-6 rounded-full transition-all relative border border-(--border)"
                  style={{ background: flashSale.isActive ? "var(--gold)" : "var(--bg-elevated)" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                    style={{ left: flashSale.isActive ? "calc(100% - 22px)" : 2, background: flashSale.isActive ? "#000" : "var(--text-muted)" }}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Promo Tagline</label>
                  <input
                    value={flashSale.tagline}
                    onChange={(e) => setFlashSale({ ...flashSale, tagline: e.target.value })}
                    className="lux-input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={flashSale.discountPercent}
                      onChange={(e) => setFlashSale({ ...flashSale, discountPercent: Number(e.target.value) })}
                      className="lux-input w-full"
                    />
                  </div>
                  <div>
                    <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={flashSale.endsAt}
                      onChange={(e) => setFlashSale({ ...flashSale, endsAt: e.target.value })}
                      className="lux-input w-full"
                    />
                  </div>
                </div>
              </div>

              <button onClick={() => toast.success("Flash Sale rule saved!")} className="btn-gold">
                Save & Publish Campaign
              </button>
            </div>
          )}

          {/* TAB 3: Free Shipping */}
          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-(--text-primary)">Automated Shipping Promotions</h4>
                <p className="text-xs text-(--text-muted) mt-1">Configure when clients receive free shipping at checkout.</p>
              </div>

              <div className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-(--text-primary)">Free Delivery Threshold</p>
                  <p className="text-[10px] text-(--text-muted)">Orders above this threshold will have delivery charges set to Rs. 0.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold">Rs.</span>
                  <input
                    type="number"
                    value={freeShipping.minOrderValue}
                    onChange={(e) => setFreeShipping({ ...freeShipping, minOrderValue: Number(e.target.value) })}
                    className="lux-input w-28 text-center"
                  />
                </div>
              </div>

              <button onClick={() => toast.success("Free shipping configurations updated")} className="btn-gold">
                Apply Shipping Settings
              </button>
            </div>
          )}

          {/* TAB 4: Cart Recovery */}
          {activeTab === "abandoned" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-(--text-primary)">Abandoned Checkout Logs</h4>
                <p className="text-xs text-(--text-muted)">Engage customers who left items in their cart.</p>
              </div>

              <div className="divide-y divide-(--border)/50">
                {abandonedCarts.map((cart) => (
                  <div key={cart.id} className="py-3 flex items-center justify-between flex-wrap gap-2 hover:bg-(--bg-elevated)/20 px-2 rounded-xl transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-(--text-primary)">{cart.customer}</span>
                        <span className="text-[10px] text-(--text-muted) font-mono">({cart.email})</span>
                      </div>
                      <p className="text-[10px] text-(--text-muted) mt-0.5">{cart.items} items · Total: Rs. {cart.total.toLocaleString()} · Abandoned {cart.time}</p>
                    </div>
                    <button onClick={() => handleRecoverCart(cart)} className="btn-outline flex items-center gap-1 text-[11px] py-1.5 px-3">
                      <FiMail size={12} /> Send Recovery Email
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Upsells */}
          {activeTab === "upsells" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-(--text-primary)">Category Match Rules</h4>
                  <p className="text-xs text-(--text-muted)">Offer discounts on cross-purchases during checkout.</p>
                </div>
                <button onClick={() => toast.info("New upsell rule template opened")} className="btn-gold flex items-center gap-1.5 text-xs">
                  <FiPlus /> Add Rule
                </button>
              </div>

              <div className="space-y-2">
                {upsells.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-(--text-primary)">
                        If Cart contains <span className="text-(--gold)">{rule.triggerCategory}</span>
                      </p>
                      <p className="text-[11px] text-(--text-muted) mt-0.5">
                        Offer <span className="text-[#4ade80] font-bold">{rule.discount}% off</span> on <span className="text-(--gold)">{rule.offerCategory}</span>
                      </p>
                    </div>
                    <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/25">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
