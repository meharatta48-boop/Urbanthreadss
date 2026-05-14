import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCategories } from "../context/CategoryContext";
import { useSubCategories } from "../context/SubCategoryContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiArrowRight, FiShoppingCart, FiFilter, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { getThumbnailUrl, getResponsiveImageSrcSet } from "../utils/cloudinaryOptimized";
import LazyImage from "../components/LazyImage";

export default function Shop() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { subCategories } = useSubCategories();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const PER_PAGE = 12;

  const handleSearchChange = (value) => {
    setSearch(value);

    if (value.length > 2) {
      const suggestions = (products || [])
        .filter((p) => p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
        .map((p) => p.name);

      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }

    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    let list = products || [];

    if (search) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      list = list.filter(
        (p) => p.category?._id === category || p.category?.name === category
      );
    }

    if (subCategory) {
      list = list.filter(
        (p) =>
          p.subCategory?._id === subCategory ||
          p.subCategory?.name === subCategory
      );
    }

    list = list.filter(
      (p) =>
        p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    switch (sortBy) {
      case "price-low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        list = [...list].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "popular":
        list = [...list].sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case "rating":
        list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return list;
  }, [products, search, category, subCategory, priceRange, inStockOnly, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  const paginated = filteredProducts.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  return (
    <div
      className="min-h-screen pt-4 pb-20"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label mb-2">Our Collection</p>
          <h1
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Shop <span className="gold-text">All Products</span>
          </h1>
        </motion.div>
      </div>

      {/* SEARCH + CONTROLS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">

          {/* SEARCH */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              size={16}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() =>
                search.length > 2 && setShowSearchSuggestions(true)
              }
              onBlur={() =>
                setTimeout(() => setShowSearchSuggestions(false), 200)
              }
              placeholder="Search products..."
              className="lux-input w-full"
              style={{ paddingLeft: "38px" }}
            />

            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg z-20 overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {searchSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearch(s);
                      setShowSearchSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SORT */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="lux-select"
            style={{ minWidth: "140px" }}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price ↑</option>
            <option value="price-high">Price ↓</option>
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="name-asc">A–Z</option>
            <option value="name-desc">Z–A</option>
          </select>

          {/* VIEW MODE */}
          <div className="flex bg-(--bg-surface) border border-(--border) rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className="px-3 py-2 text-xs rounded-lg"
              style={
                viewMode === "grid"
                  ? { background: "var(--gradient-premium)" }
                  : {}
              }
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="px-3 py-2 text-xs rounded-lg"
              style={
                viewMode === "list"
                  ? { background: "var(--gradient-premium)" }
                  : {}
              }
            >
              List
            </button>
          </div>

          {/* FILTER TOGGLE */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              background: "var(--bg-elevated)",
              minHeight: "44px",
            }}
          >
            {showFilters ? <FiX size={14} /> : <FiFilter size={14} />}
            Filters
          </button>
        </div>

        {/* FILTER PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div
                className="flex flex-wrap gap-2 p-3 rounded-2xl"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubCategory("");
                    setPage(1);
                  }}
                  className="lux-select flex-1 min-w-[140px]"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={subCategory}
                  onChange={(e) => {
                    setSubCategory(e.target.value);
                    setPage(1);
                  }}
                  className="lux-select flex-1 min-w-[140px]"
                >
                  <option value="">All Types</option>
                  {subCategories
                    .filter((s) => !category || s.category?._id === category)
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                </select>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([
                        parseInt(e.target.value) || 0,
                        priceRange[1],
                      ])
                    }
                    className="lux-input w-[80px]"
                    placeholder="Min"
                  />

                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        parseInt(e.target.value) || 10000,
                      ])
                    }
                    className="lux-input w-[80px]"
                    placeholder="Max"
                  />
                </div>

                <label
                  className="flex items-center gap-2 px-3 rounded-xl"
                  style={{
                    border: "1px solid var(--border)",
                    minHeight: "44px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  In Stock
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {paginated.length === 0 ? (
          <div className="text-center py-24">
            <FiShoppingCart
              size={40}
              className="mx-auto opacity-20"
              style={{ color: "var(--text-muted)" }}
            />
            <p style={{ color: "var(--text-muted)" }}>
              No products found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

            {paginated.map((p) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="product-card group cursor-pointer"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                <div className="product-image-container">
                  <LazyImage
                    src={getThumbnailUrl(p.images?.[0])}
                    srcSet={getResponsiveImageSrcSet(p.images?.[0], 400)}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />

                  <div className="product-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                        toast.success(
                          `${p.name} cart mein add ho gaya!`
                        );
                      }}
                      className="btn-gold flex-1"
                      style={{ minHeight: "40px" }}
                    >
                      <FiShoppingCart size={12} /> Add
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <p className="product-category">
                    {p.category?.name}
                  </p>
                  <h3 className="product-name truncate">
                    {p.name}
                  </h3>

                  <div className="product-price">
                    Rs. {p.price?.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-14">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg"
              style={{ border: "1px solid var(--border)" }}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-10 h-10 rounded-lg"
                style={{
                  border: "1px solid var(--border)",
                  background:
                    page === i + 1
                      ? "var(--gradient-premium)"
                      : "transparent",
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              className="px-4 py-2 rounded-lg"
              style={{ border: "1px solid var(--border)" }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}