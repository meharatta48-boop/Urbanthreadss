import { useRef, useState } from "react";
import { useCategories } from "../../context/CategoryContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2, FiPlus, FiLayers, FiEdit2, FiCheck, FiX,
  FiUpload, FiImage,
} from "react-icons/fi";
import { toast } from "react-toastify";

const SUGGESTIONS = ["Summer", "Winter", "Spring", "Eid Collection", "Sale"];
import { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";
const API_BASE = SERVER_URL;

/* ─── tiny reusable image-picker ─── */
function ImagePicker({ current, onFile, onRemove, label = "Image" }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null); // local blob preview

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
          <img src={displaySrc} alt="cat" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            {/* Change */}
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="w-7 h-7 bg-(--gold) rounded-full flex items-center justify-center text-black hover:bg-(--gold-light) transition-colors"
              title="Image change karo"
            >
              <FiUpload size={12} />
            </button>
            {/* Remove */}
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

export default function CategoryList() {
  const { categories, addCategory, updateCategory, removeCategory, loading } = useCategories();

  /* ADD state */
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [adding, setAdding] = useState(false);

  /* EDIT state */
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);
  const [updating, setUpdating] = useState(false);

  /* ── ADD ── */
  const handleAdd = async (catName) => {
    const n = (catName || name).trim();
    if (!n) {
      toast.error("Category name zaroori hai");
      return;
    }
    setAdding(true);
    try {
      await addCategory(n, imageFile || null);
      setName("");
      setImageFile(null);
      toast.success(`"${n}" category successfully add ho gayi ✓`);
    } catch (error) {
      console.error("Add category error:", error);
    } finally {
      setAdding(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (id, catName) => {
    if (!window.confirm(`"${catName}" delete karein? Image bhi delete ho jaegi.`)) return;
    try {
      await removeCategory(id);
      toast.success(`"${catName}" category successfully delete ho gayi`);
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error("Category delete nahi hui");
    }
  };

  /* ── EDIT ── */
  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditImageFile(null);
    setEditRemoveImage(false);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      toast.error("Category name zaroori hai");
      return;
    }
    setUpdating(true);
    try {
      await updateCategory(editId, {
        name: editName.trim(),
        imageFile: editImageFile || null,
        removeImage: editRemoveImage,
      });
      toast.success("Category successfully update ho gayi ✓");
      setEditId(null);
    } catch (error) {
      console.error("Update category error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditImageFile(null);
    setEditRemoveImage(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* HEADER */}
      <div>
        <p className="section-label mb-1">Manage</p>
        <h2 className="font-display text-3xl font-bold text-(--text-primary)">Categories</h2>
        <p className="text-(--text-muted) text-sm mt-1">
          Seasons aur collections banao:{" "}
          <span className="text-(--gold)">Summer</span>,{" "}
          <span className="text-(--gold)">Winter</span>,{" "}
          <span className="text-(--gold)">Eid Collection</span>
        </p>
      </div>

      {/* ── ADD FORM ── */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-(--text-primary) font-semibold flex items-center gap-2">
          <FiPlus className="text-(--gold)" /> Nai Category Add Karo
        </h3>

        <div className="flex gap-4 items-end flex-wrap">
          {/* Image picker */}
          <ImagePicker
            current={null}
            onFile={(f) => setImageFile(f)}
            onRemove={() => setImageFile(null)}
            label="Category Image (optional)"
          />

          {/* Name + Add button */}
          <div className="flex-1 space-y-3 min-w-50">
            <div className="flex gap-3">
              <input
                className="lux-input flex-1"
                placeholder="Category name likho (e.g. Summer)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={() => handleAdd()}
                disabled={!name.trim() || adding}
                className="btn-gold shrink-0"
                style={{ padding: "14px 24px" }}
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
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
        <div>
          <p className="text-(--text-muted) text-xs mb-2 uppercase tracking-wider">Quick add (bina image):</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS
              .filter((s) => !categories.find((c) => c.name.toLowerCase() === s.toLowerCase()))
              .map((s) => (
                <button
                  key={s}
                  onClick={() => handleAdd(s)}
                  disabled={adding}
                  className="px-3 py-1.5 text-xs rounded-lg border border-(--border) text-(--text-muted) hover:border-(--gold)/50 hover:text-(--gold) hover:bg-(--gold)/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title={`"${s}" category add karo`}
                >
                  + {s}
                </button>
              ))}
          </div>
          {SUGGESTIONS.filter((s) => categories.find((c) => c.name.toLowerCase() === s.toLowerCase())).length > 0 && (
            <p className="text-(--text-muted) text-xs mt-2">
              ✓ {SUGGESTIONS.filter((s) => categories.find((c) => c.name.toLowerCase() === s.toLowerCase())).join(", ")} already added
            </p>
          )}
        </div>
      </div>

      {/* ── LIST ── */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h3 className="text-(--text-primary) font-semibold flex items-center gap-2">
            <FiLayers size={16} className="text-(--gold)" /> All Categories
          </h3>
          <span className="badge-gold">{categories.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-(--text-muted) flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-(--text-muted)">
            <FiLayers size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Koi category nahi. Summer ya Winter add karo.</p>
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            <AnimatePresence>
              {categories.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ delay: i * 0.03 }}
                  className="px-6 py-4 hover:bg-(--bg-surface) transition-colors"
                >
                  {editId === c._id ? (
                    /* ── EDIT MODE ── */
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Edit image */}
                        <ImagePicker
                          current={editRemoveImage ? null : c.image}
                          onFile={(f) => { setEditImageFile(f); setEditRemoveImage(false); }}
                          onRemove={() => { setEditImageFile(null); setEditRemoveImage(true); }}
                          label="Image"
                        />
                        {/* Edit name */}
                        <div className="flex-1 min-w-45 space-y-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="lux-input w-full py-2"
                            autoFocus
                            placeholder="Category name"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdate}
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
                        <p className="text-xs text-orange-400 flex items-center gap-1">
                          ⚠️ Image save hone par delete ho jaegi
                        </p>
                      )}
                    </div>
                  ) : (
                    /* ── VIEW MODE ── */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Image or avatar */}
                        {c.image ? (
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-(--border) shrink-0">
                            <img
                              src={getImageUrl(c.image)}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-(--gold)/5 border border-(--gold)/20 flex items-center justify-center text-(--gold) text-sm font-bold shrink-0">
                            {c.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-(--text-primary) font-medium capitalize">{c.name}</p>
                          <p className="text-(--text-muted) text-xs">
                            {c.image ? (
                              <span className="text-(--gold)/70 flex items-center gap-1"><FiImage size={9} /> Image uploaded</span>
                            ) : (
                              <span className="text-(--text-muted)/60">No image - Season / Collection</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-2 rounded-lg text-(--text-muted) hover:text-(--gold) hover:bg-(--gold)/10 transition-all"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.name)}
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
