import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { useCategories } from "../../context/CategoryContext";
import { useSubCategories } from "../../context/SubCategoryContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload, FiX, FiArrowLeft, FiSave, FiImage,
  FiStar, FiDollarSign, FiPackage, FiLayers, FiAlignLeft,
  FiVideo
} from "react-icons/fi";

import { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";
const API_BASE = SERVER_URL;
const SIZES_PRESET = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const COLORS_PRESET = ["Black", "White", "Navy", "Grey", "Beige", "Brown", "Olive", "Red", "Blue", "Green"];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProduct, updateProduct, products } = useProducts();
  const { categories } = useCategories();
  const { subCategories } = useSubCategories();

  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  /* ── FORM STATE ── */
  const [form, setForm] = useState({
    name: "",
    price: "",
    comparePrice: "",
    stock: "",
    category: "",
    subCategory: "",
    description: "",
    sizes: [],
    colors: [],
    isFeatured: false,
    isActive: true,
  });

  /* ── IMAGE STATE ── */
  // existingImages: paths already on server e.g. ["/uploads/abc.jpg"]
  const [existingImages, setExistingImages] = useState([]);
  // newFiles: File objects newly selected
  const [newFiles, setNewFiles] = useState([]);
  // newPreviews: object URL for new files
  const [newPreviews, setNewPreviews] = useState([]);

  /* ── VIDEO STATE ── */
  const [existingVideo, setExistingVideo] = useState("");  // server path
  const [videoFile, setVideoFile]         = useState(null); // new File
  const [videoPreview, setVideoPreview]   = useState("");   // blob URL
  const [removeVideo, setRemoveVideo]     = useState(false);

  const [customColor, setCustomColor] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ── LOAD PRODUCT FOR EDIT ── */
  useEffect(() => {
    if (!id) return;
    const product = products.find((p) => p._id === id);
    if (!product) return;

    setForm({
      name: product.name || "",
      price: product.price || "",
      comparePrice: product.comparePrice || "",
      stock: product.stock || "",
      category: product.category?._id || product.category || "",
      subCategory: product.subCategory?._id || product.subCategory || "",
      description: product.description || "",
      sizes: product.sizes || [],
      colors: product.colors || [],
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
    });
    setExistingImages(product.images || []);
    setExistingVideo(product.video || "");
    setVideoFile(null);
    setVideoPreview("");
    setRemoveVideo(false);
  }, [id, products]);

  /* ── CLEANUP object URLs ── */
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [newPreviews, videoPreview]);

  /* ── FILTERED SUBCATEGORIES ── */
  const filteredSub = subCategories.filter((s) => {
    if (!s.category) return false;
    const catId = typeof s.category === "object" ? s.category._id : s.category;
    return catId === form.category;
  });

  /* ── FILE HANDLING ── */
  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} is too large (max 5MB)`); return false; }
      return true;
    });
    const total = existingImages.length + newFiles.length + valid.length;
    if (total > 8) { toast.warning("Maximum 8 images allowed"); return; }
    setNewFiles((prev) => [...prev, ...valid]);
    setNewPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  }, [existingImages.length, newFiles.length]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeExisting = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNew = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── VIDEO HANDLERS ── */
  const handleVideoPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Sirf video file allowed hai"); return; }
    if (file.size > 100 * 1024 * 1024) { toast.error("Video max 100MB honi chahiye"); return; }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setRemoveVideo(false);
    e.target.value = "";
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");
    setExistingVideo("");
    setRemoveVideo(true);
  };

  /* ── TOGGLE SIZE/COLOR ── */
  const toggleItem = (key, val) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));
  };

  const handleAddCustomColor = () => {
    const val = customColor.trim();
    if (!val) return;
    if (!form.colors.includes(val)) {
      setForm(f => ({ ...f, colors: [...f.colors, val] }));
    }
    setCustomColor("");
  };

  /* ── VALIDATION ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name required";
    if (!form.price || Number(form.price) <= 0) e.price = "Valid price required";
    if (!form.category) e.category = "Category required";
    if (existingImages.length + newFiles.length === 0) e.images = "At least 1 image required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── SUBMIT ── */
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error("Please fix errors"); return; }

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("price", form.price);
    if (form.comparePrice) data.append("comparePrice", form.comparePrice);
    data.append("stock", form.stock || 0);
    data.append("category", form.category);
    if (form.subCategory) data.append("subCategory", form.subCategory);
    data.append("description", form.description);
    data.append("isFeatured", form.isFeatured);
    data.append("isActive", form.isActive);
    // Send as JSON strings — reliable across all FormData parsers
    data.append("sizes", JSON.stringify(form.sizes));
    data.append("colors", JSON.stringify(form.colors));

    // When editing, send which existing images to keep
    if (isEdit) {
      data.append("keepImages", JSON.stringify(existingImages));
    }

    // Append new image files
    newFiles.forEach((f) => data.append("images", f));

    // Append video if newly picked
    if (videoFile) data.append("productVideo", videoFile);
    // Tell backend to clear video if admin removed it
    if (removeVideo) data.append("removeVideo", "true");

    setLoading(true);
    try {
      if (isEdit) {
        await updateProduct(id, data);
        toast.success("Product updated! ✓");
      } else {
        await addProduct(data);
        toast.success("Product created! ✓");
      }
      navigate("/admin-dashboard/products");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin-dashboard/products")}
            className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-all"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <p className="section-label mb-0.5">{isEdit ? "Edit" : "Create"}</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-(--text-primary)">
              {isEdit ? "Update Product" : "Add New Product"}
            </h2>
          </div>
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="btn-gold"
          style={{ padding: "12px 24px" }}
        >
          {loading ? "Saving..." : <><FiSave /> {isEdit ? "Update Product" : "Create Product"}</>}
        </button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ════ LEFT: IMAGE UPLOAD ════ */}
        <div className="lg:col-span-1 space-y-4">

          {/* DROP ZONE */}
          <div
            onDragEnter={() => setDragging(true)}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragging
                ? "border-(--gold) bg-(--gold)/5"
                : errors.images
                ? "border-red-500/50 bg-red-900/5"
                : "border-(--border) hover:border-(--gold)/40 hover:bg-(--gold)/3"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-(--border) flex items-center justify-center text-(--text-muted)">
                <FiUpload size={22} className={dragging ? "text-(--gold)" : ""} />
              </div>
              <div>
                <p className="text-(--text-primary) text-sm font-medium">
                  {dragging ? "Drop images here!" : "Click or drag images here"}
                </p>
                <p className="text-(--text-muted) text-xs mt-1">
                  PNG, JPG, WebP — Max 5MB each
                </p>
                <p className="text-(--text-muted)/60 text-xs mt-0.5">
                  {totalImages}/8 images uploaded
                </p>
              </div>
            </div>
            {errors.images && (
              <p className="text-red-400 text-xs mt-2">{errors.images}</p>
            )}
          </div>

          {/* IMAGE GRID PREVIEW */}
          {totalImages > 0 && (
            <div className="grid grid-cols-2 gap-2.5">
              {/* EXISTING IMAGES */}
              <AnimatePresence>
                {existingImages.map((img, i) => (
                  <motion.div
                    key={img}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-(--border) bg-(--bg-card)"
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`existing-${i}`}
                      className="w-full h-full object-cover"
                    />
                    {/* MAIN BADGE */}
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] gold-gradient text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Main
                      </span>
                    )}
                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeExisting(i); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <FiX size={11} />
                    </button>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* NEW IMAGES */}
              <AnimatePresence>
                {newPreviews.map((url, i) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-(--gold)/30 bg-(--bg-card)"
                  >
                    <img src={url} alt={`new-${i}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-(--bg-card) text-(--gold) border border-(--gold)/30 px-1.5 py-0.5 rounded font-medium">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeNew(i); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <FiX size={11} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* ADD MORE */}
              {totalImages < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border border-dashed border-(--border) hover:border-(--gold)/40 flex flex-col items-center justify-center text-(--text-muted) hover:text-(--gold) transition-all"
                >
                  <FiImage size={18} />
                  <span className="text-[10px] mt-1">Add more</span>
                </button>
              )}
            </div>
          )}

          {/* ════ VIDEO UPLOAD CARD ════ */}
          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4 space-y-3">
            <p className="text-(--text-primary) text-sm font-medium flex items-center gap-2">
              <FiVideo className="text-(--gold)" /> Product Video
              <span className="text-(--text-muted) text-xs font-normal">(Optional — max 100MB)</span>
            </p>

            {/* Hidden input */}
            <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleVideoPick} />

            {/* Preview / Upload area */}
            {(videoPreview || existingVideo) ? (
              <div className="relative rounded-xl overflow-hidden border border-(--border) bg-black">
                <video
                  src={videoPreview || getImageUrl(existingVideo)}
                  controls
                  className="w-full max-h-48 object-contain"
                  preload="metadata"
                />
                <div className="flex gap-2 mt-2 px-1 pb-1">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-all"
                  >
                    Replace Video
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-900/15 text-xs transition-all flex items-center gap-1"
                  >
                    <FiX size={12} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-(--border) hover:border-(--gold)/40 rounded-xl p-5 flex flex-col items-center gap-2 text-(--text-muted) hover:text-(--gold) transition-all cursor-pointer"
              >
                <FiVideo size={24} />
                <span className="text-sm">Click to upload video</span>
                <span className="text-xs text-(--text-muted)/60">MP4, WebM, MOV — Max 100MB</span>
              </button>
            )}
          </div>

          {/* FEATURED TOGGLE */}
          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-(--text-primary) text-sm font-medium flex items-center gap-2">
                  <FiStar className="text-(--gold)" /> Featured Product
                </p>
                <p className="text-(--text-muted) text-xs mt-0.5">Show in homepage featured section</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  form.isFeatured ? "bg-(--gold)" : "bg-(--bg-elevated)"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  form.isFeatured ? "left-6" : "left-1"
                }`} />
              </button>
            </div>
          </div>

          {/* ACTIVE TOGGLE */}
          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-(--text-primary) text-sm font-medium">Active / Visible</p>
                <p className="text-(--text-muted) text-xs mt-0.5">Customers can see this product</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  form.isActive ? "bg-green-600" : "bg-(--bg-elevated)"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  form.isActive ? "left-6" : "left-1"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ════ RIGHT: PRODUCT DETAILS ════ */}
        <div className="lg:col-span-2 space-y-5">

          {/* BASIC INFO */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 sm:p-6 space-y-5">
            <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
              <FiPackage className="text-(--gold)" /> Basic Information
            </h3>

            {/* NAME */}
            <div>
              <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Summer Men's Polo Shirt"
                className={`lux-input ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product ke baare mein likho — fabric, fit, occasion..."
                rows={4}
                className="lux-input resize-none"
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          {/* PRICING & STOCK */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 sm:p-6 space-y-5">
            <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
              <FiDollarSign className="text-(--gold)" /> Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">
                  Sale Price (Rs.) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="1499"
                  className={`lux-input ${errors.price ? "border-red-500" : ""}`}
                />
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">
                  Original Price (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  placeholder="1999 (optional)"
                  className="lux-input"
                />
                <p className="text-(--text-muted)/60 text-xs mt-1">Strikethrough price</p>
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">
                  Stock Qty *
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="50"
                  className="lux-input"
                />
              </div>
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 sm:p-6 space-y-5">
            <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
              <FiLayers className="text-(--gold)" /> Categories
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">
                  Season / Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: "" })}
                  className={`lux-select ${errors.category ? "border-red-500" : ""}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">
                  Gender / Sub-Category
                </label>
                <select
                  value={form.subCategory}
                  onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  disabled={!form.category || filteredSub.length === 0}
                  className="lux-select"
                >
                  <option value="">
                    {!form.category
                      ? "Select category first"
                      : filteredSub.length === 0
                      ? "No sub-categories found"
                      : "Select Sub-Category"}
                  </option>
                  {filteredSub.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SIZES */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
              <FiAlignLeft className="text-(--gold)" /> Sizes & Colors
            </h3>

            <div>
              <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-3">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZES_PRESET.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleItem("sizes", s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      form.sizes.includes(s)
                        ? "gold-gradient text-black border-transparent"
                        : "border-(--border) text-(--text-muted) hover:border-(--border-light) hover:text-(--text-primary)"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.sizes.length > 0 && (
                <p className="text-(--gold) text-xs mt-2">
                  Selected: {form.sizes.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-3">
                Available Colors
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from(new Set([...COLORS_PRESET, ...form.colors])).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleItem("colors", c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                      form.colors.includes(c)
                        ? "gold-gradient text-black border-transparent"
                        : "border-(--border) text-(--text-muted) hover:border-(--border-light) hover:text-(--text-primary)"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddCustomColor(); } }}
                  placeholder="Custom color likhein..."
                  className="lux-input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-all"
                >
                  Add
                </button>
              </div>
              {form.colors.length > 0 && (
                <p className="text-(--gold) text-xs mt-2">
                  Selected: {form.colors.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full"
            style={{ width: "100%", padding: "16px" }}
          >
            {loading
              ? "Saving Product..."
              : isEdit
              ? <><FiSave /> Update Product</>
              : <><FiSave /> Create Product</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
