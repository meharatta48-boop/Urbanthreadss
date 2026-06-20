import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiImage, FiLoader, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";
import LazyImage from "../../components/LazyImage";

export default function ComboForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState([]); // List of all products

  // Core Combo State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState(99);
  const [isActive, setIsActive] = useState(true);

  // Selected products inside combo
  // products format: [ { product: "", colors: [], sizes: [] }, { product: "", colors: [], sizes: [] } ]
  const [comboProducts, setComboProducts] = useState([
    { product: "", colors: [], sizes: [] },
    { product: "", colors: [], sizes: [] },
  ]);

  // Images state
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch product catalog and combo details (if edit)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Fetch all products for selector dropdowns
        const resProd = await api.get("/products?limit=250");
        const allProducts = resProd.data.data || resProd.data.products || [];
        setCatalog(allProducts);

        if (isEdit) {
          const resCombo = await api.get(`/combos/${id}`);
          const c = resCombo.data.data;
          
          setName(c.name || "");
          setDescription(c.description || "");
          setPrice(c.price || "");
          setComparePrice(c.comparePrice || "");
          setStock(c.stock !== undefined ? c.stock : 99);
          setIsActive(c.isActive !== false);
          setExistingImages(c.images || []);
          setImagesToKeep(c.images || []);

          if (c.products && c.products.length >= 2) {
            setComboProducts([
              {
                product: c.products[0].product?._id || c.products[0].product || "",
                colors: c.products[0].colors || [],
                sizes: c.products[0].sizes || [],
              },
              {
                product: c.products[1].product?._id || c.products[1].product || "",
                colors: c.products[1].colors || [],
                sizes: c.products[1].sizes || [],
              },
            ]);
          }
        }
      } catch (err) {
        toast.error("Failed to load details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  // Product Selection Handlers
  const handleProductChange = (index, productId) => {
    const selectedProd = catalog.find((p) => p._id === productId);
    setComboProducts((prev) => {
      const copy = [...prev];
      copy[index] = {
        product: productId,
        colors: selectedProd?.colors || [], // default to all product colors
        sizes: selectedProd?.sizes || [],   // default to all product sizes
      };
      return copy;
    });
  };

  const handleToggleColor = (index, color) => {
    setComboProducts((prev) => {
      const copy = [...prev];
      const current = copy[index].colors;
      if (current.includes(color)) {
        copy[index].colors = current.filter((c) => c !== color);
      } else {
        copy[index].colors = [...current, color];
      }
      return copy;
    });
  };

  const handleToggleSize = (index, size) => {
    setComboProducts((prev) => {
      const copy = [...prev];
      const current = copy[index].sizes;
      if (current.includes(size)) {
        copy[index].sizes = current.filter((s) => s !== size);
      } else {
        copy[index].sizes = [...current, size];
      }
      return copy;
    });
  };

  // Image upload handler
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);

    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveExistingImage = (img) => {
    setImagesToKeep((prev) => prev.filter((i) => i !== img));
  };

  const handleRemoveNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Combo Name is required");
    if (!price) return toast.error("Combo Price is required");
    
    const p1 = comboProducts[0];
    const p2 = comboProducts[1];
    if (!p1.product || !p2.product) {
      return toast.error("Please select both product items for the combo");
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description);
      formData.append("price", Number(price));
      formData.append("comparePrice", comparePrice ? Number(comparePrice) : 0);
      formData.append("stock", Number(stock));
      formData.append("isActive", isActive);
      formData.append("products", JSON.stringify(comboProducts));

      if (isEdit) {
        formData.append("keepImages", JSON.stringify(imagesToKeep));
      }

      newImages.forEach((img) => {
        formData.append("images", img);
      });

      let res;
      if (isEdit) {
        res = await api.put(`/combos/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/combos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.success) {
        toast.success(`Combo "${name}" saved successfully!`);
        navigate("/admin-dashboard/combos");
      } else {
        toast.error(res.data.message || "Failed to save combo offer");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error saving combo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <FiLoader className="animate-spin text-(--gold)" size={32} />
        <p className="text-(--text-muted) text-sm mt-3">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin-dashboard/combos"
            className="p-2 rounded-xl border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-light) transition-all"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <p className="section-label mb-0.5">Campaigns</p>
            <h2 className="font-display text-2xl font-bold text-(--text-primary)">
              {isEdit ? "Edit Combo Offer" : "Create Combo Offer"}
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROW 1: BASIC INFORMATION */}
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-(--gold)">Basic Information</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-(--text-secondary) mb-2">Combo Deal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Summer T-shirt Duo Pack"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="lux-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-(--text-secondary) mb-2">Description / Highlights</label>
              <textarea
                placeholder="Briefly explain what makes this combo special..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="lux-input"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-(--text-secondary) mb-2">Discounted Combo Price (Rs.) *</label>
              <input
                type="number"
                required
                min={0}
                placeholder="e.g. 2999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="lux-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--text-secondary) mb-2">Original Compare Price (Rs.)</label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 4500"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="lux-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--text-secondary) mb-2">Deal Stock (Packages) *</label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="lux-input"
              />
            </div>

            <div className="flex items-center gap-3 h-full pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-(--gold)"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-(--text-primary) cursor-pointer select-none">
                Enable this combo offer immediately
              </label>
            </div>
          </div>
        </div>

        {/* ROW 2: PRODUCTS SELECTIONS */}
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-(--gold)">Include Products & Restrict Variants</h3>
          
          <div className="grid md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-l divide-(--border)">
            
            {/* ITEM 1 SELECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-(--gold)/10 border border-(--gold)/30 text-(--gold) font-extrabold flex items-center justify-center text-xs">1</span>
                <span className="font-semibold text-sm text-(--text-primary)">Select First Combo Product *</span>
              </div>

              <select
                value={comboProducts[0].product}
                onChange={(e) => handleProductChange(0, e.target.value)}
                required
                className="lux-select"
              >
                <option value="">Choose a Product</option>
                {catalog.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Rs. {p.price})
                  </option>
                ))}
              </select>

              {comboProducts[0].product && (() => {
                const prod = catalog.find((p) => p._id === comboProducts[0].product);
                if (!prod) return null;
                return (
                  <div className="space-y-4 pt-2">
                    {/* Colors Allowed */}
                    {prod.colors?.length > 0 && (
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-(--text-muted) mb-1.5">Limit Colors Valid for Combo</label>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.colors.map((c) => {
                            const isChecked = comboProducts[0].colors.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleToggleColor(0, c)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                                  isChecked
                                    ? "bg-(--gold)/10 text-(--gold) border-(--gold)/45"
                                    : "bg-transparent text-(--text-muted) border-(--border)"
                                }`}
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes Allowed */}
                    {prod.sizes?.length > 0 && (
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-(--text-muted) mb-1.5">Limit Sizes Valid for Combo</label>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.sizes.map((s) => {
                            const isChecked = comboProducts[0].sizes.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleToggleSize(0, s)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                                  isChecked
                                    ? "bg-(--gold)/10 text-(--gold) border-(--gold)/45"
                                    : "bg-transparent text-(--text-muted) border-(--border)"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ITEM 2 SELECTION */}
            <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-(--gold)/10 border border-(--gold)/30 text-(--gold) font-extrabold flex items-center justify-center text-xs">2</span>
                <span className="font-semibold text-sm text-(--text-primary)">Select Second Combo Product *</span>
              </div>

              <select
                value={comboProducts[1].product}
                onChange={(e) => handleProductChange(1, e.target.value)}
                required
                className="lux-select"
              >
                <option value="">Choose a Product</option>
                {catalog.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Rs. {p.price})
                  </option>
                ))}
              </select>

              {comboProducts[1].product && (() => {
                const prod = catalog.find((p) => p._id === comboProducts[1].product);
                if (!prod) return null;
                return (
                  <div className="space-y-4 pt-2">
                    {/* Colors Allowed */}
                    {prod.colors?.length > 0 && (
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-(--text-muted) mb-1.5">Limit Colors Valid for Combo</label>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.colors.map((c) => {
                            const isChecked = comboProducts[1].colors.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleToggleColor(1, c)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                                  isChecked
                                    ? "bg-(--gold)/10 text-(--gold) border-(--gold)/45"
                                    : "bg-transparent text-(--text-muted) border-(--border)"
                                }`}
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes Allowed */}
                    {prod.sizes?.length > 0 && (
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-(--text-muted) mb-1.5">Limit Sizes Valid for Combo</label>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.sizes.map((s) => {
                            const isChecked = comboProducts[1].sizes.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleToggleSize(1, s)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                                  isChecked
                                    ? "bg-(--gold)/10 text-(--gold) border-(--gold)/45"
                                    : "bg-transparent text-(--text-muted) border-(--border)"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>

        {/* ROW 3: UPLOAD MEDIA */}
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-(--gold)">Upload Combo Images</h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-(--border) hover:border-(--gold)/40 rounded-2xl p-6 text-center cursor-pointer relative group transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FiImage size={28} className="mx-auto mb-2 text-(--text-muted) group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-(--text-primary)">Drag & drop images here, or click to upload</p>
              <p className="text-[10px] text-(--text-muted) mt-1">Recommended: Square format 1000 x 1000 px</p>
            </div>

            {/* PREVIEWS CONTAINER */}
            {(imagesToKeep.length > 0 || imagePreviews.length > 0) && (
              <div className="flex flex-wrap gap-4">
                {/* Existing Images */}
                {imagesToKeep.map((img) => (
                  <div key={img} className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-black/10 border border-white/5 aspect-square group">
                    <LazyImage
                      src={getImageUrl(img)}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* New Previews */}
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-black/10 border border-white/5 aspect-square group">
                    <LazyImage
                      src={preview}
                      alt="New Preview"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/admin-dashboard/combos"
            className="btn-outline px-6 h-11 text-xs flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-gold px-8 h-11 text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-(--gold)/10"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin" size={13} />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={13} />
                Save Deal Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
