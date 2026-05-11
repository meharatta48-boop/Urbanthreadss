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
          <h3 className="text-(--text-primary) font-bold">Custom Pages</h3>
          <p className="text-(--text-muted) text-xs mt-0.5">Apni marzi se pages banao — About, Privacy Policy, koi bhi</p>
        </div>
        <button onClick={() => setView("edit")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black gold-gradient shadow-lg"
        >
          <FiPlus size={14} /> New Page
        </button>
      </div>

      {loading ? (
        <p className="text-(--text-muted) text-sm text-center py-6">Loading...</p>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 text-(--text-muted)">
          <FiFileText size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Koi page nahi — "New Page" dabao</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map(page => (
            <div key={page._id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-(--bg-card) border border-(--border) shadow-sm"
              style={{ opacity: page.isVisible ? 1 : 0.45 }}>
              <FiFileText size={16} className="text-(--gold) flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-(--text-primary) text-sm font-medium">{page.title}
                  {page.showInNav && <span className="ml-2 text-[9px] bg-(--gold)/10 text-(--gold) px-1.5 py-0.5 rounded border border-(--gold)/20">NAV</span>}
                </p>
                <p className="text-(--text-muted) text-xs">/page/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg-elevated) transition-all">
                  <FiExternalLink size={14} className="text-(--text-muted) hover:text-(--text-primary)" />
                </a>
                <button onClick={() => toggleVisible(page)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg-elevated) transition-all">
                  {page.isVisible ? <FiEye size={14} className="text-(--gold)" /> : <FiEyeOff size={14} className="text-(--text-muted)" />}
                </button>
                <button onClick={() => startEdit(page)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg-elevated) transition-all">
                  <FiEdit2 size={14} className="text-(--text-muted) hover:text-(--text-primary)" />
                </button>
                <button onClick={() => del(page._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-all">
                  <FiTrash2 size={14} className="text-red-500" />
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
          <h3 className="text-(--text-primary) font-bold">{editId ? "✏️ Page Edit" : "➕ Naya Page"}</h3>
          <p className="text-(--text-muted) text-xs mt-0.5">Site par /page/{form.slug || "slug"} par dikhe ga</p>
        </div>
        <button onClick={resetForm}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-(--text-muted) hover:text-(--text-primary) transition-all border border-(--border) hover:bg-(--bg-elevated)"
        >
          <FiX size={13} /> Cancel
        </button>
      </div>

      <div className="space-y-4 p-4 rounded-2xl bg-(--bg-card) border border-(--border) shadow-sm">
        {/* Title + Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-(--text-muted) text-xs mb-1 block">Page Title *</label>
            <input value={form.title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. About Us, Privacy Policy"
              className="w-full px-3 py-2.5 rounded-xl text-sm text-(--text-primary) outline-none bg-(--bg-elevated) border border-(--border)"
            />
          </div>
          <div>
            <label className="text-(--text-muted) text-xs mb-1 block">URL Slug</label>
            <div className="flex items-center rounded-xl overflow-hidden border border-(--border) bg-(--bg-elevated)">
              <span className="text-(--text-muted) text-xs pl-3 opacity-50">/page/</span>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                placeholder="about-us"
                className="flex-1 px-2 py-2.5 text-sm text-(--text-primary) outline-none bg-transparent" />
            </div>
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <label className="text-(--text-muted) text-xs mb-1 block">Meta Description (SEO)</label>
          <input value={form.metaDesc} onChange={e => setForm(f => ({ ...f, metaDesc: e.target.value }))}
            placeholder="Google search mein jo description dikhega..."
            className="w-full px-3 py-2.5 rounded-xl text-sm text-(--text-primary) outline-none bg-(--bg-elevated) border border-(--border)"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-(--text-muted) text-xs mb-1 block">Page Content</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={12} placeholder="Page ka content yahan likhein... HTML bhi use kar sakte hain."
            className="w-full px-3 py-3 rounded-xl text-sm text-(--text-primary) outline-none font-mono resize-y bg-(--bg-elevated) border border-(--border)"
            style={{ lineHeight: 1.6 }} />
          <p className="text-(--text-muted) text-[10px] mt-1 opacity-60">Tip: HTML tags use kar sakte hain — &lt;b&gt;, &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt; etc.</p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="accent-(--gold)" />
            <span className="text-(--text-muted) text-sm">Published (visible)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.showInNav} onChange={e => setForm(f => ({ ...f, showInNav: e.target.checked }))} className="accent-(--gold)" />
            <span className="text-(--text-muted) text-sm">Navbar mein dikhao</span>
          </label>
        </div>
      </div>

      {/* Save button */}
      <div className="flex gap-3">
        <button onClick={saveForm} disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${saving ? "bg-gray-500 text-white opacity-50" : "gold-gradient text-black"}`}
        >
          <FiSave size={14} /> {saving ? "Saving..." : (editId ? "Update Page" : "Publish Page")}
        </button>
        <button onClick={resetForm}
          className="px-4 py-2.5 rounded-xl text-sm text-(--text-muted) hover:text-(--text-primary) transition-all border border-(--border) hover:bg-(--bg-elevated)"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
