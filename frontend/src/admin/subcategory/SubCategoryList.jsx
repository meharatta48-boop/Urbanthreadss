import { useRef, useState } from "react";
import { useSubCategories } from "../../context/SubCategoryContext";
import { useCategories } from "../../context/CategoryContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2, FiPlus, FiTag, FiEdit2, FiCheck, FiX,
  FiUpload, FiImage,
} from "react-icons/fi";
import { toast } from "react-toastify";

const SUGGESTIONS = ["Men", "Women", "Kids", "Unisex", "Boys", "Girls"];
import { SERVER_URL } from "../../services/api";
const API_BASE = SERVER_URL;

/* ─── tiny reusable image-picker ─── */
function ImagePicker({ current, onFile, onRemove, label = "Image" }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Sirf image files allowed hain"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Image 5MB se choti honi chahiye"); return; }
    setPreview(URL.createObjectURL(f));
    onFile(f);
  };

  const handleRemove = () => {
    setPreview(null);
    if (ref.current) ref.current.value = "";
    onRemove();
  };

  const displaySrc = preview || (current ? `${API_BASE}${current}` : null);

  return (
    <div className="space-y-2">
      <p className="text-xs text-(--text-muted) uppercase tracking-wider">{label}</p>
      {displaySrc ? (
        <div className="relative group w-24 h-24 rounded-xl overflow-hidden border border-(--border) bg-(--bg-deep)">
          <img src={displaySrc} alt="subcat" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="w-7 h-7 bg-(--gold) rounded-full flex items-center justify-center text-black hover:bg-(--gold-light) transition-colors"
              title="Image change karo"
            >
              <FiUpload size={12} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              title="Image delete karo"
            >
              <FiX size={12} />
            </button>
          </div>
          {preview && (
            <span className="absolute top-1 left-1 text-[8px] bg-(--gold) text-black px-1 rounded font-bold">NEW</span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-(--border) hover:border-(--gold)/50 flex flex-col items-center justify-center gap-1 text-(--text-muted) hover:text-(--gold) transition-all"
        >
          <FiImage size={20} />
          <span className="text-[10px]">Add Image</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export default function SubCategoryList() {
  const { subCategories, loading, addSubCategory, updateSubCategory, removeSubCategory } = useSubCategories();
  const { categories } = useCategories();

  /* ADD state */
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [adding, setAdding] = useState(false);

  /* FILTER */
  const [filterCat, setFilterCat] = useState("");

  /* EDIT state */
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);
  const [updating, setUpdating] = useState(false);

  /* ── ADD ── */
  const handleSubmit = async (suggestName) => {
    const n = (suggestName || name).trim();
    if (!n) { toast.error("Name likhna zaroori hai"); return; }
    if (!category) { toast.error("Category select karo pehle"); return; }
    setAdding(true);
    try {
      const catObj = categories.find((c) => c._id === category);
      await addSubCategory({ name: n, category, imageFile: imageFile || null });
      setName("");
      setImageFile(null);
      toast.success(`"${n}" → ${catObj?.name || "category"} mein add ho gaya ✓`);
    } catch {
      // error shown by context
    } finally {
      setAdding(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (id, scName) => {
    if (!window.confirm(`"${scName}" delete karein? Image bhi delete ho jaegi.`)) return;
    try {
      await removeSubCategory(id);
      toast.success("Sub-category delete ho gayi");
    } catch {
      // error shown by context
    }
  };

  /* ── EDIT ── */
  const startEdit = (sc) => {
    setEditId(sc._id);
    setEditName(sc.name);
    setEditImageFile(null);
    setEditRemoveImage(false);
  };

  const handleUpdate = async (sc) => {
    if (!editName.trim()) return;
    setUpdating(true);
    try {
      await updateSubCategory(sc._id, {
        name: editName.trim(),
        category: sc.category?._id || sc.category,
        imageFile: editImageFile || null,
        removeImage: editRemoveImage,
      });
      toast.success("Updated ✓");
      setEditId(null);
    } catch {
      // error shown by context
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditImageFile(null);
    setEditRemoveImage(false);
  };

  const filtered = filterCat
    ? subCategories.filter((s) => {
        const cid = typeof s.category === "object" ? s.category?._id : s.category;
        return cid === filterCat;
      })
    : subCategories;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* HEADER */}
      <div>
        <p className="section-label mb-1">Manage</p>
        <h2 className="font-display text-3xl font-bold text-(--text-primary)">Sub-Categories</h2>
        <p className="text-(--text-muted) text-sm mt-1">
          Har season ke andar:{" "}
          <span className="text-(--gold)">Men</span>,{" "}
          <span className="text-(--gold)">Women</span>,{" "}
          <span className="text-(--gold)">Kids</span>
        </p>
      </div>

      {/* ── ADD FORM ── */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-(--text-primary) font-semibold flex items-center gap-2">
          <FiPlus className="text-(--gold)" /> Nai Sub-Category Add Karo
        </h3>

        {/* CATEGORY SELECT */}
        <div>
          <label className="block text-xs text-(--text-muted) uppercase tracking-wider mb-2">Season / Category Select Karo *</label>
          <select
            className="lux-select w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Season choose karo --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-yellow-500 text-xs mt-2">⚠️ Pehle Categories page pe category banao (Summer / Winter)</p>
          )}
        </div>

        {/* IMAGE + NAME ROW */}
        <div className="flex gap-4 items-end flex-wrap">
          <ImagePicker
            current={null}
            onFile={(f) => setImageFile(f)}
            onRemove={() => setImageFile(null)}
            label="Sub-Category Image (optional)"
          />
          <div className="flex-1 min-w-[180px] space-y-3">
            <div className="flex gap-3">
              <input
                className="lux-input flex-1"
                placeholder="Sub-category name (e.g. Men)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={adding || !name.trim() || !category}
                className="btn-gold flex-shrink-0 disabled:opacity-50"
                style={{ padding: "14px 20px" }}
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><FiPlus /> Add</>
                )}
              </button>
            </div>
            {imageFile && (
              <p className="text-(--gold) text-xs flex items-center gap-1">
                <FiImage size={11} /> {imageFile.name} selected
              </p>
            )}
          </div>
        </div>

        {/* QUICK ADD */}
        {category && (
          <div>
            <p className="text-(--text-muted) text-xs mb-2 uppercase tracking-wider">Quick add (bina image):</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS
                .filter((s) => !subCategories.find((sc) => {
                  const cid = typeof sc.category === "object" ? sc.category?._id : sc.category;
                  return sc.name.toLowerCase() === s.toLowerCase() && cid === category;
                }))
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSubmit(s)}
                    disabled={adding}
                    className="px-3 py-1.5 text-xs rounded-lg border border-(--border) text-(--text-muted) hover:border-(--gold)/50 hover:text-(--gold) transition-all disabled:opacity-40"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            !filterCat ? "gold-gradient text-black shadow-lg" : "border border-(--border) text-(--text-muted) hover:text-(--text-primary)"
          }`}
        >
          All ({subCategories.length})
        </button>
        {categories.map((c) => {
          const count = subCategories.filter((s) => {
            const cid = typeof s.category === "object" ? s.category?._id : s.category;
            return cid === c._id;
          }).length;
          return (
            <button
              key={c._id}
              onClick={() => setFilterCat(c._id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterCat === c._id ? "gold-gradient text-black shadow-lg" : "border border-(--border) text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* ── LIST ── */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h3 className="text-(--text-primary) font-semibold flex items-center gap-2">
            <FiTag size={16} className="text-(--gold)" /> Sub-Categories
          </h3>
          <span className="badge-gold">{filtered.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-(--text-muted) flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-(--text-muted)">
            <FiTag size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {subCategories.length === 0
                ? "Koi sub-category nahi. Upar se add karo."
                : "Is category mein koi sub-category nahi."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            <AnimatePresence>
              {filtered.map((sc, i) => (
                <motion.div
                  key={sc._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ delay: i * 0.03 }}
                  className="px-6 py-4 hover:bg-(--bg-surface) transition-colors"
                >
                  {editId === sc._id ? (
                    /* ── EDIT MODE ── */
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <ImagePicker
                          current={editRemoveImage ? null : sc.image}
                          onFile={(f) => { setEditImageFile(f); setEditRemoveImage(false); }}
                          onRemove={() => { setEditImageFile(null); setEditRemoveImage(true); }}
                          label="Image"
                        />
                        <div className="flex-1 min-w-[160px] space-y-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(sc);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="lux-input w-full py-2"
                            autoFocus
                            placeholder="Sub-category name"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(sc)}
                              disabled={updating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-900/20 text-green-400 border border-green-900/30 hover:bg-green-900/30 transition-all disabled:opacity-50"
                            >
                              {updating ? (
                                <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiCheck size={12} />
                              )}
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-(--border) text-(--text-muted) hover:text-(--text-primary) transition-all"
                            >
                              <FiX size={12} /> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                      {editRemoveImage && (
                        <p className="text-xs text-orange-400">⚠️ Image save hone par delete ho jaegi</p>
                      )}
                    </div>
                  ) : (
                    /* ── VIEW MODE ── */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Image or avatar */}
                        {sc.image ? (
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-(--border) flex-shrink-0">
                            <img
                              src={`${API_BASE}${sc.image}`}
                              alt={sc.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-(--gold)/5 border border-(--gold)/20 flex items-center justify-center text-(--gold) text-sm font-bold flex-shrink-0">
                            {sc.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-(--text-primary) font-medium">{sc.name}</p>
                          <p className="text-(--text-muted) text-xs flex items-center gap-1">
                            Under: <span className="text-(--gold) capitalize">{sc.category?.name || "—"}</span>
                            {sc.image && (
                              <span className="ml-1 text-(--gold)/60 flex items-center gap-0.5"><FiImage size={9} /> Image</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(sc)}
                          className="p-2 rounded-lg text-(--text-muted) hover:text-(--gold) hover:bg-(--gold)/10 transition-all"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(sc._id, sc.name)}
                          className="p-2 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
