import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiSearch, FiAlertTriangle } from "react-icons/fi";
import { useProducts } from "../../context/ProductContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useState } from "react";
import { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";

const API_BASE = SERVER_URL;

export default function ProductList() {
  const { products, removeProduct, loading } = useProducts();
  const [search, setSearch] = useState("");

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" delete karein?`)) return;
    try {
      await removeProduct(id);
      toast.success("Product delete ho gaya");
    } catch {
      toast.error("Delete nahi hua");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // products that have no sizes AND no colors
  const needsUpdate = products.filter((p) => !p.sizes?.length && !p.colors?.length);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#333] gap-2">
      <div className="w-5 h-5 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      Loading products...
    </div>
  );

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h2 className="font-display text-3xl font-bold text-white">Products</h2>
        </div>
        <Link to="/admin-dashboard/products/new" className="btn-gold" style={{ padding: "12px 20px", fontSize: "0.85rem" }}>
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* ⚠️ WARNING: products without sizes/colors */}
      {needsUpdate.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-900/10 border border-orange-700/30 rounded-2xl px-5 py-4 flex items-start gap-3"
        >
          <FiAlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-400 font-semibold text-sm">
              {needsUpdate.length} product{needsUpdate.length > 1 ? "s" : ""} mein size/color nahi hai
            </p>
            <p className="text-orange-400/60 text-xs mt-0.5">
              In products ko Edit karo → Sizes aur Colors choose karo → Save karo. Tab user ko product page pe sizes/colors dikhenge.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {needsUpdate.map((p) => (
                <Link
                  key={p._id}
                  to={`/admin-dashboard/products/${p._id}/edit`}
                  className="text-xs bg-orange-900/20 text-orange-300 border border-orange-700/30 px-2.5 py-1 rounded-lg hover:bg-orange-900/40 transition-colors"
                >
                  ✏️ {p.name}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", val: products.length },
          { label: "In Stock", val: products.filter((p) => p.stock > 0).length },
          { label: "Out of Stock", val: products.filter((p) => p.stock === 0).length },
        ].map((s) => (
          <div key={s.label} className="bg-[#0c0c0c] border border-[#111] rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold gold-text">{s.val}</div>
            <div className="text-[#444] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Product naam se search karo..."
          className="lux-input"
          style={{ paddingLeft: "42px" }}
        />
      </div>

      {/* LIST */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#111] flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiPackage size={16} className="text-[#c9a84c]" /> All Products
          </h3>
          <span className="badge-gold">{filtered.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#333]">
            <FiPackage size={36} className="mx-auto mb-3 opacity-30" />
            <p>Koi product nahi mila</p>
          </div>
        ) : (
          <div className="divide-y divide-[#111]">
            <AnimatePresence>
              {filtered.map((p, i) => {
                const hasSizes = p.sizes?.length > 0;
                const hasColors = p.colors?.length > 0;
                const missing = !hasSizes && !hasColors;
                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between px-5 py-4 hover:bg-[#111] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* IMAGE */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] flex-shrink-0">
                        {p.images?.length ? (
                          <img
                            src={getImageUrl(p.images[0])}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#222]">
                            <FiPackage size={20} />
                          </div>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-medium truncate">{p.name}</p>
                          {missing && (
                            <span className="text-[9px] bg-orange-900/20 text-orange-400 border border-orange-700/20 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 flex-shrink-0">
                              <FiAlertTriangle size={8} /> Size/Color missing
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="gold-text font-semibold text-sm font-display">Rs. {p.price?.toLocaleString()}</span>

                          <span className="text-[#444] text-xs capitalize">
                            {p.category?.name}{p.subCategory?.name ? ` › ${p.subCategory.name}` : ""}
                          </span>

                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.stock === 0
                              ? "bg-red-900/20 text-red-400 border border-red-900/30"
                              : p.stock < 5
                              ? "bg-orange-900/20 text-orange-400 border border-orange-900/30"
                              : "bg-green-900/20 text-green-400 border border-green-900/30"
                          }`}>
                            {p.stock === 0 ? "Out of Stock" : `${p.stock} in stock`}
                          </span>
                        </div>

                        {/* SIZES & COLORS CHIPS */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {hasSizes && (
                            <div className="flex gap-1 flex-wrap">
                              {p.sizes.map((s) => (
                                <span key={s} className="text-[10px] bg-[#1a1a1a] text-[#9a9a9a] px-1.5 py-0.5 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {hasColors && (
                            <div className="flex gap-1 flex-wrap">
                              {p.colors.map((c) => (
                                <span key={c} className="text-[10px] text-[#c9a84c] bg-[rgba(201,168,76,0.08)] border border-[#c9a84c]/15 px-1.5 py-0.5 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Link
                        to={`/admin-dashboard/products/${p._id}/edit`}
                        className={`p-2 rounded-lg border transition-all ${
                          missing
                            ? "border-orange-700/30 text-orange-400 hover:bg-orange-900/10"
                            : "border-[#1a1a1a] text-[#444] hover:text-[#c9a84c] hover:border-[#c9a84c]/30"
                        }`}
                        title="Edit product"
                      >
                        <FiEdit size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-2 rounded-lg border border-[#1a1a1a] text-[#444] hover:text-red-400 hover:border-red-900/30 hover:bg-red-900/10 transition-all"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}