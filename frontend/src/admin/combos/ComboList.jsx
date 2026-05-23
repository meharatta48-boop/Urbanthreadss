import { Link } from "react-router-dom";
import {
  FiPlus, FiEdit, FiTrash2, FiTag, FiSearch,
  FiAlertCircle, FiRefreshCw, FiCheckCircle, FiXCircle, FiPackage
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import api, { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";
import LazyImage from "../../components/LazyImage";

export default function ComboList() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/combos/admin/all");
      setCombos(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load combo offers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const handleDelete = async (id, name) => {
    setDeleting(true);
    try {
      await api.delete(`/combos/${id}`);
      toast.success(`Combo Offer "${name}" deleted`);
      setCombos((prev) => prev.filter((c) => c._id !== id));
      setDeleteId(null);
    } catch (err) {
      toast.error("Could not delete combo offer");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (combo) => {
    try {
      const res = await api.put(`/combos/${combo._id}`, {
        isActive: !combo.isActive,
      });
      if (res.data.success) {
        toast.success(`Combo "${combo.name}" ${!combo.isActive ? "enabled" : "disabled"}`);
        setCombos((prev) =>
          prev.map((c) => (c._id === combo._id ? { ...c, isActive: !combo.isActive } : c))
        );
      }
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const filtered = combos.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="w-16 h-3 bg-(--bg-elevated) rounded mb-2 animate-pulse" />
          <div className="w-28 h-7 bg-(--bg-elevated) rounded animate-pulse" />
        </div>
        <div className="w-32 h-10 bg-(--bg-elevated) rounded-xl animate-pulse" />
      </div>
      <div className="w-full h-12 bg-(--bg-card) border border-(--border) rounded-xl animate-pulse" />
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden h-64 animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Manage Deals</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-(--text-primary)">Combo Offers</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCombos}
            className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-all"
            title="Refresh"
          >
            <FiRefreshCw size={15} />
          </button>
          <Link
            to="/admin-dashboard/combos/new"
            className="btn-gold"
            style={{ padding: "10px 18px", fontSize: "0.8rem" }}
          >
            <FiPlus size={14} /> Create Combo
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Combos", val: combos.length, color: "text-(--gold)" },
          { label: "Active Offers", val: combos.filter((c) => c.isActive).length, color: "text-green-600" },
          { label: "Out of Stock", val: combos.filter((c) => c.stock === 0).length, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-center">
            <div className={`font-display text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-(--text-muted) text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search combo offers..."
          className="lux-input"
          style={{ paddingLeft: "40px" }}
        />
      </div>

      {/* LISTING */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between">
          <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
            <FiTag size={15} className="text-(--gold)" /> All Combos
          </h3>
          <span className="badge-gold">
            {filtered.length} items
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-(--text-muted)">
            <FiTag size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No combo offers found</p>
            <p className="text-xs mt-1 opacity-60">Create a combo offer to drive multi-item discounted sales</p>
            <Link
              to="/admin-dashboard/combos/new"
              className="btn-gold mt-4 inline-flex"
              style={{ padding: "10px 20px", fontSize: "0.8rem" }}
            >
              <FiPlus size={13} /> Create First Combo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            <AnimatePresence>
              {filtered.map((c, i) => {
                const isDeleting = deleteId === c._id;
                const p1 = c.products?.[0]?.product;
                const p2 = c.products?.[1]?.product;

                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="px-5 py-4 hover:bg-(--bg-surface) transition-colors"
                  >
                    {isDeleting ? (
                      /* DELETE CONFIRM */
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3"
                      >
                        <FiAlertCircle size={15} className="text-red-500 shrink-0" />
                        <p className="text-sm text-(--text-primary) flex-1 truncate">
                          Delete combo <span className="font-semibold">"{c.name}"</span>?
                        </p>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleDelete(c._id, c.name)}
                            disabled={deleting}
                            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all disabled:opacity-50 font-medium"
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-3 py-1.5 text-xs border border-(--border) text-(--text-muted) hover:text-(--text-primary) rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* COMBO ROW */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Image Box */}
                          <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-(--bg-deep) border border-(--border) aspect-square">
                            {c.images?.length ? (
                              <LazyImage
                                src={getImageUrl(c.images[0])}
                                alt={c.name}
                                className="absolute inset-0 w-full h-full object-cover object-center"
                              />
                            ) : p1?.images?.length ? (
                              <LazyImage
                                src={getImageUrl(p1.images[0])}
                                alt={c.name}
                                className="absolute inset-0 w-full h-full object-cover object-center"
                              />
                            ) : (
                              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-(--text-muted)">
                                <FiTag size={18} />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-(--text-primary) font-semibold truncate text-sm">{c.name}</h4>
                            
                            {/* Products included */}
                            <div className="flex items-center gap-1 text-[11px] text-(--text-muted) mt-0.5 truncate">
                              <FiPackage size={10} className="shrink-0" />
                              <span>
                                {p1 ? p1.name : "Product 1"} + {p2 ? p2.name : "Product 2"}
                              </span>
                            </div>

                            {/* Prices & Stock */}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="gold-text font-semibold text-xs font-display">
                                Rs. {c.price?.toLocaleString()}
                              </span>
                              {c.comparePrice > c.price && (
                                <span className="line-through text-(--text-muted) text-[10px]">
                                  Rs. {c.comparePrice?.toLocaleString()}
                                </span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                c.stock === 0
                                  ? "bg-red-500/10 text-red-500"
                                  : c.stock < 10
                                  ? "bg-orange-500/10 text-orange-500"
                                  : "bg-green-500/10 text-green-600"
                              }`}>
                                {c.stock === 0 ? "Out of stock" : `${c.stock} packages`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Toggles & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Active State Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleActive(c)}
                            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl border transition-all ${
                              c.isActive
                                ? "bg-green-500/8 border-green-500/20 text-green-600 hover:bg-green-500/15"
                                : "bg-red-500/8 border-red-500/20 text-red-500 hover:bg-red-500/15"
                            }`}
                          >
                            {c.isActive ? (
                              <>
                                <FiCheckCircle size={12} /> Active
                              </>
                            ) : (
                              <>
                                <FiXCircle size={12} /> Disabled
                              </>
                            )}
                          </button>

                          {/* Edit / Delete */}
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/admin-dashboard/combos/${c._id}/edit`}
                              className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30 transition-all"
                              title="Edit combo offer"
                            >
                              <FiEdit size={13} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(c._id)}
                              className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/8 transition-all"
                              title="Delete combo offer"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
