import { useRef, useState } from "react";
import { useCategories } from "../../context/CategoryContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2, FiPlus, FiLayers, FiEdit2, FiCheck, FiX,
  FiUpload, FiImage, FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { SERVER_URL } from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";

const SUGGESTIONS = ["Summer", "Winter", "Spring", "Eid Collection", "Sale"];

/* ─── Image Picker ─── */
function ImagePicker({ current, onFile, onRemove, label = "Image" }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setPreview(URL.createObjectURL(f));
    onFile(f);
  };

  const handleRemove = () => {
    setPreview(null);
    if (ref.current) ref.current.value = "";
    onRemove();
  };

  const displaySrc = preview || (current ? getImageUrl(current) : null);

  return (
    <div className="space-y-2">
      <p className="text-xs text-(--text-muted) uppercase tracking-wider font-medium">{label}</p>
      {displaySrc ? (
        <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-(--border) bg-(--bg-deep)">
          <img src={displaySrc} alt="category" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="w-7 h-7 bg-(--gold) rounded-full flex items-center justify-center text-black hover:bg-(--gold-light) transition-colors"
              title="Change image"
            >
              <FiUpload size={11} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              title="Remove image"
            >
              <FiX size={11} />
            </button>
          </div>
          {preview && (
            <span className="absolute top-1 left-1 text-[8px] gold-gradient text-black px-1.5 py-0.5 rounded font-bold">
              NEW
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-(--border) hover:border-(--gold)/50 flex flex-col items-center justify-center gap-1 text-(--text-muted) hover:text-(--gold) transition-all group"
        >
          <FiImage size={18} className="group-hover:scale-110 transition-transform" />
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

/* ─── Delete Confirm ─── */
function DeleteConfirm({ name, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3"
    >
      <FiAlertCircle size={16} className="text-red-500 shrink-0" />
      <p className="text-sm text-(--text-primary) flex-1">
        Delete <span className="font-semibold">"{name}"</span>?
      </p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all disabled:opacity-50 font-medium"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs border border-(--border) text-(--text-muted) hover:text-(--text-primary) rounded-lg transition-all"
        >
          Cancel
        </button>
      </div>
    </motion.div>
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

  /* DELETE confirm state */
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── ADD ── */
  const handleAdd = async (catName) => {
    const n = (catName || name).trim();
    if (!n) { toast.error("Category name required"); return; }
    setAdding(true);
    try {
      await addCategory(n, imageFile || null);
      setName("");
      setImageFile(null);
      toast.success(`"${n}" category added ✓`);
    } catch (error) {
      console.error("Add category error:", error);
    } finally {
      setAdding(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (id, catName) => {
    setDeleting(true);
    try {
      await removeCategory(id);
      toast.success(`"${catName}" deleted`);
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Could not delete category");
    } finally {
      setDeleting(false);
    }
  };

  /* ── EDIT ── */
  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditImageFile(null);
    setEditRemoveImage(false);
    setDeleteId(null);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) { toast.error("Category name required"); return; }
    setUpdating(true);
    try {
      await updateCategory(editId, {
        name: editName.trim(),
        imageFile: editImageFile || null,
        removeImage: editRemoveImage,
      });
      toast.success("Category updated ✓");
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
      {/* ── HEADER ── */}
      <div>
        <p className="section-label mb-1">Manage</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-(--text-primary)">Categories</h2>
        <p className="text-(--text-muted) text-sm mt-1">
          Create seasons and collections:{" "}
          <span className="text-(--gold)">Summer</span>,{" "}
          <span className="text-(--gold)">Winter</span>,{" "}
          <span className="text-(--gold)">Eid Collection</span>
        </p>
      </div>

      {/* ── ADD FORM ── */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
          <FiPlus className="text-(--gold)" /> Add New Category
        </h3>

        <div className="flex gap-4 items-end flex-wrap">
          <ImagePicker
            current={null}
            onFile={(f) => setImageFile(f)}
            onRemove={() => setImageFile(null)}
            label="Category Image (optional)"
          />

          <div className="flex-1 space-y-3 min-w-[180px]">
            <div className="flex gap-2">
              <input
                className="lux-input flex-1"
                placeholder="Category name (e.g. Summer)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={() => handleAdd()}
                disabled={!name.trim() || adding}
                className="btn-gold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: "12px 20px", fontSize: "0.8rem" }}
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <><FiPlus size={14} /> Add</>
                )}
              </button>
            </div>
            {imageFile && (
              <p className="text-(--gold) text-xs flex items-center gap-1">
                <FiImage size={11} /> {imageFile.name}
              </p>
            )}
          </div>
        </div>

        {/* QUICK ADD */}
        <div>
          <p className="text-(--text-muted) text-xs mb-2 uppercase tracking-wider">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS
              .filter((s) => !categories.find((c) => c.name.toLowerCase() === s.toLowerCase()))
              .map((s) => (
                <button
                  key={s}
                  onClick={() => handleAdd(s)}
                  disabled={adding}
                  className="px-3 py-1.5 text-xs rounded-xl border border-(--border) text-(--text-muted) hover:border-(--gold)/50 hover:text-(--gold) hover:bg-(--gold)/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + {s}
                </button>
              ))}
            {SUGGESTIONS.filter((s) => categories.find((c) => c.name.toLowerCase() === s.toLowerCase())).length === SUGGESTIONS.length && (
              <p className="text-(--text-muted)/60 text-xs flex items-center gap-1">
                <FiCheck size={10} className="text-green-500" /> All suggestions added
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── LIST ── */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between">
          <h3 className="text-(--text-primary) font-semibold flex items-center gap-2 text-sm">
            <FiLayers size={15} className="text-(--gold)" /> All Categories
          </h3>
          <span className="badge-gold">{categories.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-(--text-muted) flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-(--text-muted)">
            <FiLayers size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No categories yet</p>
            <p className="text-xs mt-1 opacity-60">Add Summer or Winter above to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            <AnimatePresence>
              {categories.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ delay: i * 0.03 }}
                  className="px-5 py-4 hover:bg-(--bg-surface) transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {deleteId === c._id ? (
                      <motion.div key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DeleteConfirm
                          name={c.name}
                          loading={deleting}
                          onConfirm={() => handleDelete(c._id, c.name)}
                          onCancel={() => setDeleteId(null)}
                        />
                      </motion.div>
                    ) : editId === c._id ? (
                      /* EDIT MODE */
                      <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <ImagePicker
                            current={editRemoveImage ? null : c.image}
                            onFile={(f) => { setEditImageFile(f); setEditRemoveImage(false); }}
                            onRemove={() => { setEditImageFile(null); setEditRemoveImage(true); }}
                            label="Image"
                          />
                          <div className="flex-1 min-w-[160px] space-y-2">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdate();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="lux-input w-full"
                              autoFocus
                              placeholder="Category name"
                              style={{ padding: "10px 14px" }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 transition-all disabled:opacity-50 font-medium"
                              >
                                {updating ? (
                                  <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiCheck size={12} />
                                )}
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-(--border) text-(--text-muted) hover:text-(--text-primary) transition-all"
                              >
                                <FiX size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                        {editRemoveImage && (
                          <p className="text-xs text-orange-500 flex items-center gap-1">
                            <FiAlertCircle size={11} /> Image will be removed on save
                          </p>
                        )}
                      </motion.div>
                    ) : (
                      /* VIEW MODE */
                      <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {c.image ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-(--border) shrink-0">
                              <img
                                src={getImageUrl(c.image)}
                                alt={c.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-(--gold)/8 border border-(--gold)/20 flex items-center justify-center text-(--gold) font-bold shrink-0">
                              {c.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-(--text-primary) font-medium capitalize truncate">{c.name}</p>
                            <p className="text-(--text-muted) text-xs">
                              {c.image ? (
                                <span className="text-(--gold)/70 flex items-center gap-1">
                                  <FiImage size={9} /> Image uploaded
                                </span>
                              ) : (
                                <span className="opacity-60">No image</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(c)}
                            className="p-2 rounded-xl text-(--text-muted) hover:text-(--gold) hover:bg-(--gold)/8 transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(c._id)}
                            className="p-2 rounded-xl text-(--text-muted) hover:text-red-500 hover:bg-red-500/8 transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
