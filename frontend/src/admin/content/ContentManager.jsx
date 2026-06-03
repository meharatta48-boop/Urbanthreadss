import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiBookOpen, FiPlus, FiTrash2, FiEdit, FiLayers, FiImage, FiFileText, FiHelpCircle,
  FiUpload, FiSearch, FiCheck, FiExternalLink, FiEye
} from "react-icons/fi";

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState("blogs");
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Editors open state
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);

  // Form States
  const [blogForm, setBlogForm] = useState({ title: "", content: "", image: "", tags: "", author: "Admin", isPublished: true });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "General", isActive: true, order: 0 });

  // Load functions
  const loadBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      if (res.data.success) setBlogs(res.data.blogs || []);
    } catch { toast.error("Failed to load blogs"); }
  };

  const loadFaqs = async () => {
    try {
      const res = await api.get("/faqs");
      if (res.data.success) setFaqs(res.data.faqs || []);
    } catch { toast.error("Failed to load FAQs"); }
  };

  const loadPages = async () => {
    try {
      const res = await api.get("/pages");
      if (res.data.success) setPages(res.data.data || []);
    } catch { /* Page fetch error silent */ }
  };

  useEffect(() => {
    if (activeTab === "blogs") loadBlogs();
    if (activeTab === "faqs") loadFaqs();
    if (activeTab === "pages") loadPages();
  }, [activeTab]);

  // Blog CRUD
  const saveBlog = async (e) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        await api.put(`/blogs/${editingBlog._id}`, blogForm);
        toast.success("Blog updated!");
      } else {
        await api.post("/blogs", blogForm);
        toast.success("Blog created!");
      }
      setIsBlogFormOpen(false);
      setEditingBlog(null);
      setBlogForm({ title: "", content: "", image: "", tags: "", author: "Admin", isPublished: true });
      loadBlogs();
    } catch {
      toast.error("Failed to save blog");
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog deleted");
      loadBlogs();
    } catch { toast.error("Failed to delete blog"); }
  };

  // FAQ CRUD
  const saveFaq = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq._id}`, faqForm);
        toast.success("FAQ updated!");
      } else {
        await api.post("/faqs", faqForm);
        toast.success("FAQ created!");
      }
      setIsFaqFormOpen(false);
      setEditingFaq(null);
      setFaqForm({ question: "", answer: "", category: "General", isActive: true, order: 0 });
      loadFaqs();
    } catch {
      toast.error("Failed to save FAQ");
    }
  };

  const deleteFaq = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/faqs/${id}`);
      toast.success("FAQ deleted");
      loadFaqs();
    } catch { toast.error("Failed to delete FAQ"); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-950/20 to-slate-900/10 border border-emerald-900/20 p-6 rounded-2xl">
        <p className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase mb-0.5">CMS Control</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">Content Management</h2>
        <p className="text-(--text-muted) text-xs mt-1">Design blogs, FAQ sheets, custom subpages, and direct media library catalogs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border)">
        {[
          { id: "blogs", label: "Blog Articles", icon: <FiBookOpen /> },
          { id: "faqs", label: "FAQs Manager", icon: <FiHelpCircle /> },
          { id: "pages", label: "Pages Manager", icon: <FiFileText /> },
          { id: "media", label: "Media Library", icon: <FiImage /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === t.id
                ? "border-(--gold) text-(--gold) bg-(--gold)/5"
                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl"
        >
          {/* TAB 1: Blogs */}
          {activeTab === "blogs" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-(--text-primary)">Blog Posts</h4>
                <button
                  onClick={() => {
                    setEditingBlog(null);
                    setBlogForm({ title: "", content: "", image: "", tags: "", author: "Admin", isPublished: true });
                    setIsBlogFormOpen(true);
                  }}
                  className="btn-gold flex items-center gap-1.5 text-xs"
                >
                  <FiPlus /> New Article
                </button>
              </div>

              {isBlogFormOpen ? (
                <form onSubmit={saveBlog} className="space-y-4 bg-(--bg-elevated) p-5 rounded-xl border border-(--border)">
                  <div className="flex justify-between items-center border-b border-(--border) pb-2 mb-2">
                    <h5 className="text-xs font-bold text-(--text-primary)">{editingBlog ? "Edit Article" : "Create Article"}</h5>
                    <button type="button" onClick={() => setIsBlogFormOpen(false)} className="text-xs text-red-400">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Title *</label>
                      <input
                        required
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        className="lux-input w-full"
                      />
                    </div>
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Image URL</label>
                      <input
                        value={blogForm.image}
                        onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                        className="lux-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Content (Markdown / HTML Supported) *</label>
                    <textarea
                      required
                      rows={6}
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      className="lux-input w-full font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Tags (comma-separated)</label>
                      <input
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                        className="lux-input w-full"
                      />
                    </div>
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Author</label>
                      <input
                        value={blogForm.author}
                        onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                        className="lux-input w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5 pl-2">
                      <input
                        type="checkbox"
                        checked={blogForm.isPublished}
                        onChange={(e) => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                        className="w-4 h-4 accent-(--gold)"
                        id="blogPub"
                      />
                      <label htmlFor="blogPub" className="text-xs text-(--text-primary) font-semibold">Publish immediately</label>
                    </div>
                  </div>

                  <button type="submit" className="btn-gold">Save & Publish</button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogs.map((b) => (
                    <div key={b._id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-xs text-(--text-primary) truncate max-w-72">{b.title}</h5>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${b.isPublished ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"}`}>
                            {b.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className="text-[10px] text-(--text-muted) mt-1">By {b.author} · {new Date(b.createdAt).toLocaleDateString()}</p>
                        <p className="text-[11px] text-(--text-muted) line-clamp-2 mt-2 font-light">{b.content.replace(/<[^>]*>/g, "")}</p>
                      </div>
                      <div className="flex gap-2 justify-end mt-4 border-t border-(--border)/40 pt-2">
                        <button
                          onClick={() => {
                            setEditingBlog(b);
                            setBlogForm({ title: b.title, content: b.content, image: b.image || "", tags: b.tags?.join(",") || "", author: b.author, isPublished: b.isPublished });
                            setIsBlogFormOpen(true);
                          }}
                          className="text-xs text-(--gold) flex items-center gap-1 hover:brightness-110"
                        >
                          <FiEdit size={12} /> Edit
                        </button>
                        <button onClick={() => deleteBlog(b._id)} className="text-xs text-red-400 flex items-center gap-1 hover:brightness-110">
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FAQs */}
          {activeTab === "faqs" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-(--text-primary)">FAQs List</h4>
                <button
                  onClick={() => {
                    setEditingFaq(null);
                    setFaqForm({ question: "", answer: "", category: "General", isActive: true, order: 0 });
                    setIsFaqFormOpen(true);
                  }}
                  className="btn-gold flex items-center gap-1.5 text-xs"
                >
                  <FiPlus /> Add FAQ
                </button>
              </div>

              {isFaqFormOpen ? (
                <form onSubmit={saveFaq} className="space-y-4 bg-(--bg-elevated) p-5 rounded-xl border border-(--border)">
                  <div className="flex justify-between items-center border-b border-(--border) pb-2 mb-2">
                    <h5 className="text-xs font-bold text-(--text-primary)">{editingFaq ? "Edit FAQ" : "Create FAQ"}</h5>
                    <button type="button" onClick={() => setIsFaqFormOpen(false)} className="text-xs text-red-400">Cancel</button>
                  </div>

                  <div>
                    <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Question *</label>
                    <input
                      required
                      value={faqForm.question}
                      onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                      className="lux-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Answer *</label>
                    <textarea
                      required
                      rows={4}
                      value={faqForm.answer}
                      onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                      className="lux-input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Category</label>
                      <input
                        value={faqForm.category}
                        onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                        className="lux-input w-full"
                      />
                    </div>
                    <div>
                      <label className="text-(--text-muted) text-[10px] uppercase font-bold block mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={faqForm.order}
                        onChange={(e) => setFaqForm({ ...faqForm, order: Number(e.target.value) })}
                        className="lux-input w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5 pl-2">
                      <input
                        type="checkbox"
                        checked={faqForm.isActive}
                        onChange={(e) => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                        className="w-4 h-4 accent-(--gold)"
                        id="faqAct"
                      />
                      <label htmlFor="faqAct" className="text-xs text-(--text-primary) font-semibold">Active</label>
                    </div>
                  </div>

                  <button type="submit" className="btn-gold">Save FAQ</button>
                </form>
              ) : (
                <div className="space-y-2">
                  {faqs.map((f) => (
                    <div key={f._id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-(--gold)/10 text-(--gold) border border-(--gold)/25 px-2 py-0.5 rounded font-bold">{f.category}</span>
                        <p className="text-xs font-bold text-(--text-primary)">{f.question}</p>
                        <p className="text-[11px] text-(--text-muted) font-light">{f.answer}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingFaq(f);
                            setFaqForm({ question: f.question, answer: f.answer, category: f.category, isActive: f.isActive, order: f.order });
                            setIsFaqFormOpen(true);
                          }}
                          className="text-xs text-(--gold)"
                        >
                          <FiEdit size={12} />
                        </button>
                        <button onClick={() => deleteFaq(f._id)} className="text-xs text-red-400">
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Pages */}
          {activeTab === "pages" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-(--border)/50 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-(--text-primary)">Custom CMS Subpages</h4>
                  <p className="text-xs text-(--text-muted)">Editable dynamic pages that link on navigation/footer.</p>
                </div>
              </div>
              <div className="space-y-2">
                {pages.length === 0 ? (
                  <p className="text-xs text-(--text-muted) text-center py-6">Use Settings &gt; Pages to create custom sub-pages dynamically.</p>
                ) : (
                  pages.map((p) => (
                    <div key={p._id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-(--text-primary)">{p.title}</p>
                        <p className="text-[10px] text-(--text-muted) font-mono">Slug: /page/{p.slug}</p>
                      </div>
                      <a href={`/page/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-(--gold) flex items-center gap-1.5 hover:underline">
                        <FiEye size={12} /> View Page
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Media Library */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-(--text-primary)">Direct Media Library</h4>
                  <p className="text-xs text-(--text-muted)">Upload images directly to get links for sliders or blogs.</p>
                </div>
              </div>

              {/* Grid Placeholder layout with upload capability trigger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                {[
                  { name: "Summer Drop Hero", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
                  { name: "Pakistani Streetwear Fit", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80" },
                  { name: "Winter Hoodie Design", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80" },
                  { name: "Urban Threads Bag Pack", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" }
                ].map((item, idx) => (
                  <div key={idx} className="group relative rounded-xl overflow-hidden border border-(--border) bg-(--bg-elevated) aspect-square">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-[10px] font-bold text-white truncate">{item.name}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.img);
                          toast.success("Image URL copied!");
                        }}
                        className="text-[9px] text-(--gold) font-bold mt-1 text-left"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border border-dashed border-(--border) rounded-2xl text-center">
                <FiUpload size={24} className="mx-auto text-(--text-muted) mb-2" />
                <p className="text-xs text-(--text-primary) font-semibold">Upload Image to Cloudinary</p>
                <p className="text-[10px] text-(--text-muted) mt-0.5">Files are optimized on storage.</p>
                <button onClick={() => toast.info("Select file dialog")} className="btn-gold text-xs px-4 py-2 mt-4 mx-auto block">Select File</button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
