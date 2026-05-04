import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiPlus, FiTrash2, FiEdit2, FiSave, FiX,
  FiEye, FiEyeOff, FiFileText, FiExternalLink, FiCopy,
} from "react-icons/fi";

export default function PagesTab() {
  const [pages, setPages]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState("list"); // "list" | "edit"
  const [form, setForm]       = useState({ title: "", slug: "", content: "", metaDesc: "", isVisible: true, showInNav: false });
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/pages");
      if (data.success) setPages(data.pages);
    } catch { toast.error("Load error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPages(); }, []);

  // Auto-generate slug
  const handleTitleChange = (val) => {
    const slug = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm(f => ({ ...f, title: val, slug: editId ? f.slug : slug }));
  };

  const saveForm = async () => {
    if (!form.title.trim()) return toast.error("Title zaroori hai");
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/pages/${editId}`, form);
        if (data.success) { setPages(p => p.map(x => x._id === editId ? data.page : x)); toast.success("Page updated!"); }
      } else {
        const { data } = await api.post("/pages", form);
        if (data.success) { setPages(p => [data.page, ...p]); toast.success("Page create ho gaya!"); }
      }
      resetForm();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Page permanently delete hoga — confirm?")) return;
    try {
      await api.delete(`/pages/${id}`);
      setPages(p => p.filter(x => x._id !== id));
      toast.success("Page deleted");
    } catch { toast.error("Delete error"); }
  };

  const startEdit = (page) => {
    setForm({ title: page.title, slug: page.slug, content: page.content, metaDesc: page.metaDesc || "", isVisible: page.isVisible, showInNav: page.showInNav });
    setEditId(page._id);
    setView("edit");
  };

  const resetForm = () => {
    setForm({ title: "", slug: "", content: "", metaDesc: "", isVisible: true, showInNav: false });
    setEditId(null);
    setView("list");
  };

  const toggleVisible = async (page) => {
    try {
      const { data } = await api.put(`/pages/${page._id}`, { isVisible: !page.isVisible });
      if (data.success) setPages(p => p.map(x => x._id === page._id ? data.page : x));
    } catch { toast.error("Error"); }
  };

  /* ═══ LIST VIEW ═══ */
  if (view === "list") return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">Custom Pages</h3>
          <p className="text-[#555] text-xs mt-0.5">Apni marzi se pages banao — About, Privacy Policy, koi bhi</p>
        </div>
        <button onClick={() => setView("edit")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
          style={{ background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }}>
          <FiPlus size={14} /> New Page
        </button>
      </div>

      {loading ? (
        <p className="text-[#555] text-sm text-center py-6">Loading...</p>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 text-[#333]">
          <FiFileText size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Koi page nahi — "New Page" dabao</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map(page => (
            <div key={page._id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", opacity: page.isVisible ? 1 : 0.45 }}>
              <FiFileText size={16} className="text-[#c9a84c] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{page.title}
                  {page.showInNav && <span className="ml-2 text-[9px] bg-[#c9a84c20] text-[#c9a84c] px-1.5 py-0.5 rounded">NAV</span>}
                </p>
                <p className="text-[#444] text-xs">/page/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-all">
                  <FiExternalLink size={13} className="text-[#555]" />
                </a>
                <button onClick={() => toggleVisible(page)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-all">
                  {page.isVisible ? <FiEye size={13} className="text-[#c9a84c]" /> : <FiEyeOff size={13} className="text-[#333]" />}
                </button>
                <button onClick={() => startEdit(page)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-all">
                  <FiEdit2 size={13} className="text-[#555]" />
                </button>
                <button onClick={() => del(page._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-900/30 transition-all">
                  <FiTrash2 size={13} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ═══ EDITOR VIEW ═══ */
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">{editId ? "✏️ Page Edit" : "➕ Naya Page"}</h3>
          <p className="text-[#555] text-xs mt-0.5">Site par /page/{form.slug || "slug"} par dikhe ga</p>
        </div>
        <button onClick={resetForm}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#555] hover:text-white transition-all"
          style={{ border: "1px solid #1a1a1a" }}>
          <FiX size={13} /> Cancel
        </button>
      </div>

      <div className="space-y-4 p-4 rounded-2xl" style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}>
        {/* Title + Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[#555] text-xs mb-1 block">Page Title *</label>
            <input value={form.title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. About Us, Privacy Policy"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: "#111", border: "1px solid #1a1a1a" }} />
          </div>
          <div>
            <label className="text-[#555] text-xs mb-1 block">URL Slug</label>
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid #1a1a1a", background: "#111" }}>
              <span className="text-[#333] text-xs pl-3">/page/</span>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                placeholder="about-us"
                className="flex-1 px-2 py-2.5 text-sm text-white outline-none bg-transparent" />
            </div>
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <label className="text-[#555] text-xs mb-1 block">Meta Description (SEO)</label>
          <input value={form.metaDesc} onChange={e => setForm(f => ({ ...f, metaDesc: e.target.value }))}
            placeholder="Google search mein jo description dikhega..."
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "#111", border: "1px solid #1a1a1a" }} />
        </div>

        {/* Content */}
        <div>
          <label className="text-[#555] text-xs mb-1 block">Page Content</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={12} placeholder="Page ka content yahan likhein... HTML bhi use kar sakte hain."
            className="w-full px-3 py-3 rounded-xl text-sm text-white outline-none font-mono resize-y"
            style={{ background: "#111", border: "1px solid #1a1a1a", lineHeight: 1.6 }} />
          <p className="text-[#333] text-xs mt-1">Tip: HTML tags use kar sakte hain — &lt;b&gt;, &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt; etc.</p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} />
            <span className="text-[#888] text-sm">Published (visible)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.showInNav} onChange={e => setForm(f => ({ ...f, showInNav: e.target.checked }))} />
            <span className="text-[#888] text-sm">Navbar mein dikhao</span>
          </label>
        </div>
      </div>

      {/* Save button */}
      <div className="flex gap-3">
        <button onClick={saveForm} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-all"
          style={{ background: saving ? "#555" : "linear-gradient(135deg,#c9a84c,#e8c96a)" }}>
          <FiSave size={14} /> {saving ? "Saving..." : (editId ? "Update Page" : "Publish Page")}
        </button>
        <button onClick={resetForm}
          className="px-4 py-2.5 rounded-xl text-sm text-[#555] hover:text-white transition-all"
          style={{ border: "1px solid #1a1a1a" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
