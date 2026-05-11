import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiPlus, FiTrash2, FiEdit2, FiSave, FiX,
  FiExternalLink, FiEye, FiEyeOff, FiMenu,
} from "react-icons/fi";

export default function NavigationTab() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ label: "", url: "", isExternal: false, isVisible: true });
  const [adding, setAdding] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/nav-links");
      if (data.success) setLinks(data.links);
    } catch { toast.error("Load error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!form.label.trim() || !form.url.trim()) return toast.error("Label aur URL zaroori hain");
    try {
      if (editId) {
        const { data } = await api.put(`/nav-links/${editId}`, form);
        if (data.success) { setLinks(l => l.map(x => x._id === editId ? data.link : x)); toast.success("Updated!"); }
      } else {
        const { data } = await api.post("/nav-links", form);
        if (data.success) { setLinks(l => [...l, data.link]); toast.success("Link add ho gaya!"); }
      }
      resetForm();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this link?")) return;
    try {
      await api.delete(`/nav-links/${id}`);
      setLinks(l => l.filter(x => x._id !== id));
      toast.success("Deleted");
    } catch { toast.error("Delete error"); }
  };

  const toggleVisible = async (link) => {
    try {
      const { data } = await api.put(`/nav-links/${link._id}`, { isVisible: !link.isVisible });
      if (data.success) setLinks(l => l.map(x => x._id === link._id ? data.link : x));
    } catch { toast.error("Error"); }
  };

  const moveUp = async (i) => {
    if (i === 0) return;
    const updated = [...links];
    [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
    const reordered = updated.map((l, idx) => ({ _id: l._id, order: idx }));
    setLinks(updated);
    await api.put("/nav-links/reorder", { links: reordered });
  };

  const moveDown = async (i) => {
    if (i === links.length - 1) return;
    const updated = [...links];
    [updated[i + 1], updated[i]] = [updated[i], updated[i + 1]];
    const reordered = updated.map((l, idx) => ({ _id: l._id, order: idx }));
    setLinks(updated);
    await api.put("/nav-links/reorder", { links: reordered });
  };

  const resetForm = () => {
    setForm({ label: "", url: "", isExternal: false, isVisible: true });
    setEditId(null);
    setAdding(false);
  };

  const startEdit = (link) => {
    setForm({ label: link.label, url: link.url, isExternal: link.isExternal, isVisible: link.isVisible });
    setEditId(link._id);
    setAdding(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-(--text-primary) font-bold">Navigation Links</h3>
          <p className="text-(--text-muted) text-xs mt-0.5">Site navbar mein dikhne wale links — add, edit, reorder, hide</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all gold-gradient shadow-lg"
          >
            <FiPlus size={14} /> Add Link
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {adding && (
        <div className="p-4 rounded-2xl space-y-3 bg-(--bg-card) border border-(--border) shadow-sm">
          <p className="text-(--text-primary) font-semibold text-sm">{editId ? "✏️ Edit Link" : "➕ New Navigation Link"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-(--text-muted) text-xs mb-1 block">Label (Jo dikhega)</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Shop, About Us, Contact"
                className="w-full px-3 py-2 rounded-xl text-sm text-(--text-primary) outline-none bg-(--bg-elevated) border border-(--border)"
              />
            </div>
            <div>
              <label className="text-(--text-muted) text-xs mb-1 block">URL</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="e.g. /shop or https://..."
                className="w-full px-3 py-2 rounded-xl text-sm text-(--text-primary) outline-none bg-(--bg-elevated) border border-(--border)"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isExternal} onChange={e => setForm(f => ({ ...f, isExternal: e.target.checked }))} className="accent-(--gold)" />
              <span className="text-(--text-muted) text-xs flex items-center gap-1"><FiExternalLink size={11} /> New tab mein kholein</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="accent-(--gold)" />
              <span className="text-(--text-muted) text-xs">Visible</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black gold-gradient shadow-lg"
            >
              <FiSave size={13} /> {editId ? "Update" : "Save Link"}
            </button>
            <button onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-(--text-muted) hover:text-(--text-primary) transition-all border border-(--border) hover:bg-(--bg-elevated)"
            >
              <FiX size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <p className="text-(--text-muted) text-sm text-center py-6">Loading...</p>
      ) : links.length === 0 ? (
        <div className="text-center py-10 text-(--text-muted)">
          <FiMenu size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Koi link nahi — upar "Add Link" dabao</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={link._id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-(--bg-card) border border-(--border) shadow-sm"
              style={{ opacity: link.isVisible ? 1 : 0.45 }}>
              {/* Order buttons */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(i)} className="text-(--text-muted) hover:text-(--gold) text-xs leading-none transition-colors">▲</button>
                <button onClick={() => moveDown(i)} className="text-(--text-muted) hover:text-(--gold) text-xs leading-none transition-colors">▼</button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-(--text-primary) text-sm font-medium">{link.label}
                  {link.isExternal && <FiExternalLink size={10} className="inline ml-1 text-(--text-muted)" />}
                </p>
                <p className="text-(--text-muted) text-xs truncate">{link.url}</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => toggleVisible(link)} title={link.isVisible ? "Hide" : "Show"}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-(--bg-elevated)">
                  {link.isVisible
                    ? <FiEye size={14} className="text-(--gold)" />
                    : <FiEyeOff size={14} className="text-(--text-muted)" />}
                </button>
                <button onClick={() => startEdit(link)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg-elevated) transition-all">
                  <FiEdit2 size={14} className="text-(--text-muted) hover:text-(--text-primary)" />
                </button>
                <button onClick={() => del(link._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-all">
                  <FiTrash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl text-xs text-(--text-muted) border border-dashed border-(--border) bg-(--bg-surface)/50">
        💡 Reorder karne ke liye ▲ ▼ buttons use karo. Changes site par turant apply ho jaenge.
      </div>
    </div>
  );
}
