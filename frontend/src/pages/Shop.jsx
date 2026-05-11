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
import { getThumbnailUrl, getResponsiveImageSrcSet } from "../utils/cloudinaryOptimized";
import LazyImage from "../components/LazyImage";

const API_BASE = SERVER_URL;

export default function Shop() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { subCategories, loading: subCategoriesLoading } = useSubCategories();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const PER_PAGE = 12;

  // Enhanced search with suggestions
  const handleSearchChange = (value) => {
    setSearch(value);
    if (value.length > 2) {
      const suggestions = products
        .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
        .map(p => p.name);
      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }
    setPage(1);
  };

  // Enhanced filtering
  const filteredProducts = useMemo(() => {
    let list = products || [];
    
    // Search filter
    if (search) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Category filter
    if (category) {
      list = list.filter(p => p.category?.name === category);
    }
    
    // Subcategory filter
    if (subCategory) {
      list = list.filter(p => p.subCategory?.name === subCategory);
    }
    
    // Price range filter
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    // Stock filter
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }
    
    // Enhanced sorting
    switch (sortBy) {
      case 'price-low':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        list = [...list].sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case 'rating':
        list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Featured - keep original order
        break;
    }

    return list;
  }, [products, search, category, subCategory, priceRange, inStockOnly, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  const paginated = filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen pt-4 pb-20" style={{ backgroundColor: 'var(--bg-deep)' }}>
      {/* PAGE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="section-label mb-2">Our Collection</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
            Shop <span className="gold-text">All Products</span>
          </h1>
        </motion.div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
        {/* Enhanced Search with Suggestions */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => search.length > 2 && setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              placeholder="Search products, categories..."
              className="lux-input pl-11"
              style={{ padding: "12px 16px 12px 42px" }}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-(--bg-card) border border-(--border) rounded-xl shadow-lg z-10 overflow-hidden">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearch(suggestion);
                      setShowSearchSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-(--bg-surface) transition-colors text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="lux-select"
            style={{ minWidth: '150px' }}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-(--bg-surface) border border-(--border) rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                viewMode === 'grid' ? 'bg-(--gold) text-black' : 'text-(--text-muted)'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                viewMode === 'list' ? 'bg-(--gold) text-black' : 'text-(--text-muted)'
              }`}
            >
              List
            </button>
          </div>

          {/* Mobile: filter toggle button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", minHeight: '44px' }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {showFilters ? <FiX size={15} /> : <FiFilter size={15} />}
            {showFilters ? "Close" : "Filters"}
          </button>
          
          {/* Desktop: items count */}
          <div className="hidden sm:flex items-center text-sm px-3 rounded-xl"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <FiFilter size={13} className="mr-1.5" /> {filteredProducts.length} Products
          </div>
        </div>

        {/* FILTERS */}
        <motion.div
          className={`${showFilters ? "flex" : "hidden sm:flex"} flex-col sm:flex-row gap-2 sm:gap-3 rounded-2xl p-3`}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
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

          {/* Price Range */}
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Price:</span>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="lux-input w-20 text-sm"
              placeholder="Min"
            />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
              className="lux-input w-20 text-sm"
              placeholder="Max"
            />
          </div>

          {/* Stock Filter */}
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-muted)" }}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4"
            />
            In Stock Only
          </label>

          {/* Mobile count */}
          <div className="sm:hidden flex items-center text-sm px-3 rounded-xl ml-auto"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <FiFilter size={13} className="mr-1.5" /> {filteredProducts.length} Products
          </div>
        </motion.div>
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
                style={{ minHeight: '300px' }}
              >
                {/* IMAGE */}
                <div className="product-image-container">
                  <LazyImage
                    src={getThumbnailUrl(p.images?.[0])}
                    srcSet={getResponsiveImageSrcSet(p.images?.[0], 400)}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="product-overlay" />
                  
                  <div className="product-actions">
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
                      style={{ padding: "8px 12px", fontSize: "0.78rem", minHeight: '36px' }}
                    >
                      <FiShoppingCart size={12} /> Add
                    </button>
                    <button
                      onClick={() => navigate(`/product/${p._id}`)}
                      className="btn-outline text-xs"
                      style={{ padding: "8px 12px", fontSize: "0.78rem", minHeight: '36px' }}
                    >
                      <FiArrowRight size={12} />
                    </button>
                  </div>

                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-white text-xs font-bold tracking-[0.2em] uppercase px-3 py-1.5 border border-white/30 rounded-lg">OUT OF STOCK</span>
                    </div>
                  )}
                  {p.comparePrice > p.price && (
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg uppercase tracking-tighter">
                        -{Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%
                      </span>
                      <span className="bg-(--bg-card)/60 backdrop-blur-xs text-(--gold) px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest text-[7px] border border-(--gold)/20">
                        Sale
                      </span>
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="product-info">
                  <p className="product-category">{p.category?.name}</p>
                  <h3 className="product-name truncate">{p.name}</h3>
                  <div className="product-price">
                    <div className="flex flex-col">
                      {p.comparePrice > p.price && (
                        <span className="product-price-original">
                          Rs. {p.comparePrice?.toLocaleString()}
                        </span>
                      )}
                      <span className="product-price-current">
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
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)", minHeight: '44px' }}
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
                style={page !== i + 1 ? { border: "1px solid var(--border)", color: "var(--text-muted)", minHeight: '40px' } : { minHeight: '40px' }}
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
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)", minHeight: '44px' }}
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