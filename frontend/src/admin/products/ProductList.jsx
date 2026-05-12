import { Link } from "react-router-dom";
import {
  FiPlus, FiEdit, FiTrash2, FiPackage, FiSearch,
  FiAlertTriangle, FiChevronLeft, FiChevronRight, FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { useProducts } from "../../context/ProductContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useState } from "react";
import { getImageUrl } from "../../utils/imageUrl";

export default function ProductList() {
  const { products, removeProduct, loading, fetchProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 20;

  const handleDelete = async (id, name) => {
    setDeleting(true);
    try {
      await removeProduct(id);
      toast.success(`"${name}" deleted`);
      setDeleteId(null);
    } catch {
      toast.error("Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset page on search change
  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const needsUpdate = products.filter((p) => !p.sizes?.length && !p.colors?.length);

  /* ── LOADING SKELETON ── */
  if (loading) return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="w-16 h-3 bg-(--bg-elevated) rounded mb-2 animate-pulse" />
          <div className="w-28 h-7 bg-(--bg-elevated) rounded animate-pulse" />
        </div>
        <div className="w-32 h-10 bg-(--bg-elevated) rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-center">
            <div className="w-8 h-6 bg-(--bg-elevated) rounded mx-auto mb-2 animate-pulse" />
            <div className="w-12 h-3 bg-(--bg-elevated) rounded mx-auto animate-pulse" />
          </div>
        ))}
      </div>
      <div className="w-full h-12 bg-(--bg-card) border border-(--border) rounded-xl animate-pulse" />
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-(--border)">
          <div className="w-32 h-5 bg-(--bg-elevated) rounded animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-(--bg-elevated) rounded-xl animate-pulse" />
              <div>
                <div className="w-32 h-4 bg-(--bg-elevated) rounded mb-2 animate-pulse" />
                <div className="w-24 h-3 bg-(--bg-elevated) rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-(--bg-elevated) rounded animate-pulse" />
              <div className="w-8 h-8 bg-(--bg-elevated) rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-(--text-primary)">Products</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-all"
            title="Refresh"
          >
            <FiRefreshCw size={15} />
          </button>
          <Link
            to="/admin-dashboard/products/new"
            className="btn-gold"
            style={{ padding: "10px 18px", fontSize: "0.8rem" }}
          >
            <FiPlus size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* ── MISSING SIZE/COLOR WARNING ── */}
      {needsUpdate.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/5 border border-orange-500/20 rounded-2xl px-5 py-4 flex items-start gap-3"
        >
          <FiAlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-orange-600 font-semibold text-sm">
              {needsUpdate.length} product{needsUpdate.length > 1 ? "s" : ""} missing size/color
            </p>
            <p className="text-orange-500/70 text-xs mt-0.5">
              Edit these products to add sizes and colors so customers can choose on the product page.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {needsUpdate.slice(0, 5).map((p) => (
                <Link
                  key={p._id}
                  to={`/admin-dashboard/products/${p._id}/edit`}
                  className="text-xs bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2.5 py-1 rounded-lg hover:bg-orange-500/20 transition-all"
                >
                  ✏️ {p.name}
                </Link>
              ))}
              {needsUpdate.length > 5 && (
                <span className="text-xs text-orange-500/60 py-1">+{needsUpdate.length - 5} more</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",        val: products.length,                                    color: "text-(--gold)" },
          { label: "In Stock",     val: products.filter((p) => p.stock > 0).length,         color: "text-green-600" },
          { label: "Out of Stock", val: products.filter((p) => p.stock === 0).length,       color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
            <div className={`font-display text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-(--text-muted) text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── SEARCH ── */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" size={14} />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products by name..."
          className="lux-input"
          style={{ paddingLeft: "40px" }}
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
            <FiAlertCircle size={14} />
          </button>
        )}
      </div>

      {/* ── LIST ── */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between">
          <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
            <FiPackage size={15} className="text-(--gold)" /> All Products
          </h3>
          <span className="badge-gold">
            {search ? `${filtered.length} of ${products.length}` : `${products.length} items`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-(--text-muted)">
            <FiPackage size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {search ? `No products matching "${search}"` : "No products yet"}
            </p>
            <p className="text-xs mt-1 opacity-60">
              {search ? "Try a different search term" : "Add your first product to get started"}
            </p>
            {!search && (
              <Link
                to="/admin-dashboard/products/new"
                className="btn-gold mt-4 inline-flex"
                style={{ padding: "10px 20px", fontSize: "0.8rem" }}
              >
                <FiPlus size={13} /> Add First Product
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-(--border)">
              <AnimatePresence>
                {paginated.map((p, i) => {
                  const hasSizes = p.sizes?.length > 0;
                  const hasColors = p.colors?.length > 0;
                  const missing = !hasSizes && !hasColors;
                  const isDeleting = deleteId === p._id;

                  return (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="px-5 py-4 hover:bg-(--bg-surface) transition-colors"
                    >
                      {isDeleting ? (
                        /* INLINE DELETE CONFIRM */
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3"
                        >
                          <FiAlertCircle size={15} className="text-red-500 shrink-0" />
                          <p className="text-sm text-(--text-primary) flex-1 min-w-0 truncate">
                            Delete <span className="font-semibold">"{p.name}"</span>?
                          </p>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleDelete(p._id, p.name)}
                              disabled={deleting}
                              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all disabled:opacity-50 font-medium"
                            >
                              {deleting ? "..." : "Delete"}
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
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* IMAGE */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-(--bg-deep) border border-(--border) shrink-0">
                              {p.images?.length ? (
                                <img
                                  src={getImageUrl(p.images[0])}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-(--text-muted)">
                                  <FiPackage size={18} />
                                </div>
                              )}
                            </div>

                            {/* INFO */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-(--text-primary) font-medium truncate text-sm">{p.name}</p>
                                {missing && (
                                  <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-0.5 shrink-0">
                                    <FiAlertTriangle size={7} /> no size/color
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="gold-text font-semibold text-sm font-display">
                                  Rs. {p.price?.toLocaleString()}
                                </span>
                                {p.category?.name && (
                                  <span className="text-(--text-muted) text-xs capitalize">
                                    {p.category.name}{p.subCategory?.name ? ` › ${p.subCategory.name}` : ""}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  p.stock === 0
                                    ? "bg-red-500/10 text-red-500"
                                    : p.stock < 5
                                    ? "bg-orange-500/10 text-orange-500"
                                    : "bg-green-500/10 text-green-600"
                                }`}>
                                  {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                                </span>
                              </div>
                              {/* SIZES & COLORS */}
                              {(hasSizes || hasColors) && (
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {hasSizes && (
                                    <div className="flex gap-1 flex-wrap">
                                      {p.sizes.slice(0, 5).map((s) => (
                                        <span key={s} className="text-[10px] bg-(--bg-surface) text-(--text-muted) px-1.5 py-0.5 rounded border border-(--border)">
                                          {s}
                                        </span>
                                      ))}
                                      {p.sizes.length > 5 && <span className="text-[10px] text-(--text-muted)/60">+{p.sizes.length - 5}</span>}
                                    </div>
                                  )}
                                  {hasColors && (
                                    <div className="flex gap-1 flex-wrap">
                                      {p.colors.slice(0, 4).map((c) => (
                                        <span key={c} className="text-[10px] text-(--gold) bg-(--gold)/5 border border-(--gold)/15 px-1.5 py-0.5 rounded">
                                          {c}
                                        </span>
                                      ))}
                                      {p.colors.length > 4 && <span className="text-[10px] text-(--text-muted)/60">+{p.colors.length - 4}</span>}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Link
                              to={`/admin-dashboard/products/${p._id}/edit`}
                              className={`p-2 rounded-xl border transition-all ${
                                missing
                                  ? "border-orange-500/30 text-orange-500 hover:bg-orange-500/8"
                                  : "border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30"
                              }`}
                              title="Edit product"
                            >
                              <FiEdit size={14} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(p._id)}
                              className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/8 transition-all"
                              title="Delete product"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-(--border) flex items-center justify-between gap-4">
                <p className="text-(--text-muted) text-xs">
                  Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <FiChevronLeft size={15} />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) page = i + 1;
                      else if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-8 h-8 text-xs rounded-lg border transition-all font-medium ${
                            currentPage === page
                              ? "gold-gradient text-black border-transparent shadow-sm"
                              : "border-(--border) text-(--text-muted) hover:text-(--text-primary)"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--gold) hover:border-(--gold)/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <FiChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}