import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCategories } from "../context/CategoryContext";
import { useSubCategories } from "../context/SubCategoryContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiArrowRight, FiShoppingCart, FiFilter, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { getThumbnailUrl, getResponsiveImageSrcSet } from "../utils/cloudinaryOptimized";
import LazyImage from "../components/LazyImage";

const API_BASE = SERVER_URL;

export default function Shop() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { subCategories } = useSubCategories();
  const { addToCart } = useCart();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const PER_PAGE = 12;

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !category || p.category?._id === category;
      const matchSub = !subCategory || p.subCategory?._id === subCategory;
      return matchSearch && matchCat && matchSub;
    });

    if (sort === "low-high") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high-low") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, search, category, subCategory, sort]);

  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  const paginated = filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen pt-4 pb-20" style={{ background: "var(--bg-deep)" }}>
      {/* PAGE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="section-label mb-2">Our Collection</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
            Shop <span className="gold-text">All Products</span>
          </h1>
        </motion.div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8">
        {/* Search + mobile filter toggle */}
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="lux-input pl-11"
              style={{ padding: "12px 16px 12px 42px" }}
            />
          </div>
          {/* Mobile: filter toggle button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {showFilters ? <FiX size={15} /> : <FiFilter size={15} />}
            {showFilters ? "Close" : "Filters"}
          </button>
          {/* Desktop: items count */}
          <div className="hidden sm:flex items-center text-sm px-3 rounded-xl"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <FiFilter size={13} className="mr-1.5" /> {filteredProducts.length}
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className={`${showFilters ? "flex" : "hidden sm:flex"} flex-col sm:flex-row gap-2 sm:gap-3 rounded-2xl p-3`}
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              {/* CATEGORY */}
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubCategory(""); setPage(1); }}
                className="lux-select sm:w-44"
                style={{ padding: "11px 40px 11px 14px" }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>

              {/* SUBCATEGORY */}
              <select
                value={subCategory}
                onChange={(e) => { setSubCategory(e.target.value); setPage(1); }}
                className="lux-select sm:w-44"
                style={{ padding: "11px 40px 11px 14px" }}
              >
                <option value="">All Types</option>
                {subCategories
                  .filter((s) => !category || s.category?._id === category)
                  .map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>

              {/* SORT */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="lux-select sm:w-44"
                style={{ padding: "11px 40px 11px 14px" }}
              >
                <option value="default">Default Sort</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>

              {/* Mobile count */}
              <div className="sm:hidden flex items-center text-sm px-2" style={{ color: "var(--text-muted)" }}>
                <FiFilter size={13} className="mr-1.5" /> {filteredProducts.length} items
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {paginated.length === 0 ? (
          <div className="text-center py-24">
            <FiShoppingCart size={40} className="mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginated.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="product-card group cursor-pointer"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden aspect-3/4">
                  <LazyImage
                    src={getThumbnailUrl(p.images?.[0])}
                    srcSet={getResponsiveImageSrcSet(p.images?.[0], 400)}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700"
                    style={{ transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.08)"}
                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-3 inset-x-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        if (p.sizes?.length > 0 || p.colors?.length > 0) {
                          navigate(`/product/${p._id}`);
                        } else {
                          addToCart(p); 
                          toast.success(`${p.name} cart mein add ho gaya!`); 
                        }
                      }}
                      className="btn-gold flex-1 text-xs"
                      style={{ padding: "8px 12px", fontSize: "0.78rem" }}
                    >
                      <FiShoppingCart size={12} /> Add
                    </button>
                    <button
                      onClick={() => navigate(`/product/${p._id}`)}
                      className="btn-outline text-xs"
                      style={{ padding: "8px 12px", fontSize: "0.78rem" }}
                    >
                      <FiArrowRight size={12} />
                    </button>
                  </div>

                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold tracking-wider">OUT OF STOCK</span>
                    </div>
                  )}
                  {p.comparePrice > p.price && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                      -{Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div className="p-3.5">
                  <p className="text-[10px] uppercase tracking-widest mb-1"
                    style={{ color: "var(--text-muted)" }}>{p.category?.name}</p>
                  <h3 className="font-medium text-sm truncate"
                    style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex flex-col">
                      {p.comparePrice > p.price && (
                        <span className="text-[10px] line-through opacity-50 mb-0.5" style={{ color: "var(--text-muted)" }}>
                          Rs. {p.comparePrice?.toLocaleString()}
                        </span>
                      )}
                      <span className="gold-text font-bold font-display text-base">
                        Rs. {p.price?.toLocaleString()}
                      </span>
                    </div>
                    {p.stock > 0 && p.stock < 5 && (
                      <span className="text-[10px] text-orange-400">Only {p.stock} left</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-14">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  page === i + 1 ? "gold-gradient text-black" : ""
                }`}
                style={page !== i + 1 ? { border: "1px solid var(--border)", color: "var(--text-muted)" } : {}}
                onMouseEnter={e => { if (page !== i + 1) { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.color = "var(--gold)"; } }}
                onMouseLeave={e => { if (page !== i + 1) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; } }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}