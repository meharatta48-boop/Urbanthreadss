import { useState, useEffect, useRef, useCallback } from "react";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { DesignStudioTab, SectionsTab, AnnouncementTab, CustomCSSTab, TypographySizesTab, ImageSizesTab, IconsTab } from "./DesignTabs";
import NavigationTab from "./NavigationTab";
import PagesTab from "./PagesTab";
import {
  FiSave, FiGlobe, FiHome, FiAlignLeft, FiPhone,
  FiShoppingCart, FiCheckCircle, FiImage, FiUpload,
  FiTrash2, FiX, FiStar, FiMessageSquare, FiPlus, FiEdit2, FiLayout,
  FiDroplet, FiType, FiEye, FiCode, FiZap, FiToggleLeft, FiToggleRight,
  FiSearch, FiDownload, FiNavigation, FiFileText, FiSliders,
} from "react-icons/fi";

import { SERVER_URL } from "../../services/api";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const tabs = [
  { id: "control",    label: "Control Center", icon: <FiSliders />,      desc: "One-click presets, backup, quick toggles" },
  { id: "general",    label: "General",      icon: <FiGlobe />,        desc: "Brand, site title, favicon, announcement" },
  { id: "media",      label: "Media",        icon: <FiImage />,        desc: "Hero slides, logo, brand image" },
  { id: "content",    label: "Content",      icon: <FiAlignLeft />,    desc: "Hero text, brand story, sections" },
  { id: "about",      label: "About Page",   icon: <FiFileText />,     desc: "About Us page content & images" },
  { id: "navigation", label: "Navigation",   icon: <FiNavigation />,   desc: "Nav links add, reorder, hide" },
  { id: "pages",      label: "Pages",        icon: <FiFileText />,     desc: "Custom pages create/edit/delete" },
  { id: "shop",       label: "Shop",         icon: <FiShoppingCart />, desc: "Delivery, coupons, contact, social" },
  { id: "appearance", label: "Appearance",   icon: <FiDroplet />,      desc: "Colors, fonts, icons, CSS" },
  { id: "reviews",    label: "Reviews",      icon: <FiStar />,         desc: "Customer reviews management" },
  { id: "advanced",   label: "Advanced",     icon: <FiZap />,          desc: "Popup, Maintenance, Scripts, Currency" },
];

export default function SiteSettingsPage() {
  const { settings, updateSettings, uploadHeroImages, deleteHeroImage, uploadBrandImage, uploadLogo, fetchSettings, deleteSettingImage, deleteSlideImage } = useSettings();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const fileImportRef = useRef(null);
  const localBackupKey = "site_settings_local_backup_v1";
  const mediaUrl = useCallback((path) => resolveMediaUrl(path, SERVER_URL), []);

  useEffect(() => {
    if (settings) { setForm({ ...settings }); setDirty(false); }
  }, [settings]);

  const set = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setDirty(true); };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await updateSettings(form, token);
      if (res.success) {
        toast.success("Settings saved!");
        setSaved(true); setDirty(false);
        setTimeout(() => setSaved(false), 3000);
      } else toast.error("Save failed");
    } catch { toast.error("Error saving"); }
    finally { setSaving(false); }
  }, [form, token, updateSettings]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const saveCombo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
      if (!saveCombo) return;
      e.preventDefault();
      if (!saving) handleSave();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, handleSave]);

  // Export settings as JSON
  const handleExport = () => {
    const exportData = { ...form };
    delete exportData._id; delete exportData.__v; delete exportData.createdAt; delete exportData.updatedAt;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `settings_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Settings exported!");
  };

  // Import settings from JSON
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        setForm(f => ({ ...f, ...imported }));
        setDirty(true);
        toast.success("Settings imported! Save karo apply karne ke liye.");
      } catch { toast.error("Invalid JSON file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const applyPreset = (patch, name) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    toast.success(`${name} preset apply ho gaya`);
  };

  const saveLocalBackup = () => {
    try {
      const payload = {
        savedAt: new Date().toISOString(),
        data: form,
      };
      localStorage.setItem(localBackupKey, JSON.stringify(payload));
      toast.success("Local backup save ho gaya");
    } catch {
      toast.error("Local backup save nahi hua");
    }
  };

  const restoreLocalBackup = () => {
    try {
      const raw = localStorage.getItem(localBackupKey);
      if (!raw) return toast.error("Backup mila nahi");
      const parsed = JSON.parse(raw);
      if (!parsed?.data) return toast.error("Backup invalid hai");
      setForm((prev) => ({ ...prev, ...parsed.data }));
      setDirty(true);
      toast.success("Backup restore ho gaya, ab Save Changes karo");
    } catch {
      toast.error("Backup restore nahi hua");
    }
  };

  // Filter tabs by search
  const filteredTabs = search
    ? tabs.filter(t => t.label.toLowerCase().includes(search.toLowerCase()) || t.desc?.toLowerCase().includes(search.toLowerCase()))
    : tabs;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="section-label mb-1">Pro CMS — WordPress Level</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Site Settings</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Unsaved indicator */}
          {dirty && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400 px-3 py-1.5 rounded-full"
              style={{ background: "#1a1400", border: "1px solid #3a2800" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Unsaved changes
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-green-400 px-3 py-1.5 rounded-full"
              style={{ background: "#001a0a", border: "1px solid #003a15" }}>
              <FiCheckCircle size={11} /> Saved!
            </span>
          )}
          {/* Import */}
          <input ref={fileImportRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={() => fileImportRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#555] hover:text-white transition-all"
            style={{ border: "1px solid #1a1a1a" }} title="Import settings from JSON">
            <FiDownload size={13} /> Import
          </button>
          {/* Export */}
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#555] hover:text-white transition-all"
            style={{ border: "1px solid #1a1a1a" }} title="Export settings as JSON backup">
            <FiDownload size={13} style={{ transform: "rotate(180deg)" }} /> Export
          </button>
          {/* Save */}
          {activeTab !== "media" && activeTab !== "navigation" && activeTab !== "pages" && (
            <button onClick={handleSave} disabled={saving}
              className="btn-gold flex items-center gap-2" style={{ padding: "10px 20px", fontSize: 13 }}>
              {saved ? <FiCheckCircle size={14} /> : <FiSave size={14} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative">
        <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tab dhundho... (general, media, navigation, pages...)"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }} />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333] hover:text-white">
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* ── QUICK STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl" style={{ background: "#0c0c0c", border: "1px solid #111" }}>
        <div>
          <label className="text-[#444] text-[10px] uppercase tracking-wider block mb-1">Brand Name</label>
          <input value={form.brandName || ""} onChange={e => set("brandName", e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: "#111", border: "1px solid #1a1a1a" }} />
        </div>
        <div>
          <label className="text-[#444] text-[10px] uppercase tracking-wider block mb-1">Phone</label>
          <input value={form.phone || ""} onChange={e => set("phone", e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: "#111", border: "1px solid #1a1a1a" }} />
        </div>
        <div>
          <label className="text-[#444] text-[10px] uppercase tracking-wider block mb-1">WhatsApp</label>
          <input value={form.whatsapp || ""} onChange={e => set("whatsapp", e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: "#111", border: "1px solid #1a1a1a" }} />
        </div>
        <div>
          <label className="text-[#444] text-[10px] uppercase tracking-wider block mb-1">Delivery (Rs.)</label>
          <input type="number" value={form.deliveryCharges || ""} onChange={e => set("deliveryCharges", e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs text-white outline-none"
            style={{ background: "#111", border: "1px solid #1a1a1a" }} />
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 flex-wrap border-b border-[#111] pb-0.5 overflow-x-auto">
        {filteredTabs.map((t) => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch(""); }}
            title={t.desc}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-medium transition-all -mb-px whitespace-nowrap ${
              activeTab === t.id
                ? "text-[#c9a84c] border border-b-[#0a0a0a] border-[#111] bg-[#0a0a0a]"
                : "text-[#555] hover:text-white"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TAB PANELS */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "control" && (
          <ControlCenterTab
            form={form}
            set={set}
            applyPreset={applyPreset}
            onSaveLocalBackup={saveLocalBackup}
            onRestoreLocalBackup={restoreLocalBackup}
          />
        )}

        {/* ── General: brand + favicon + announcement ── */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <GeneralTab form={form} set={set} />
            <AnnouncementTab form={form} set={set} />
          </div>
        )}

        {/* ── Media: hero slides + all images/logos ── */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <SlidesTab settings={settings} token={token} fetchSettings={fetchSettings} deleteSlideImage={deleteSlideImage} mediaUrl={mediaUrl} />
            <ImagesTab token={token} settings={settings} uploadHeroImages={uploadHeroImages} deleteHeroImage={deleteHeroImage} uploadBrandImage={uploadBrandImage} uploadLogo={uploadLogo} deleteSettingImage={deleteSettingImage} form={form} set={set} fetchSettings={fetchSettings} mediaUrl={mediaUrl} />
          </div>
        )}

        {/* ── Content: hero text + brand story + sections text ── */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <HeroTab form={form} set={set} />
            <BrandTab form={form} set={set} />
            <SectionsTab form={form} set={set} />
          </div>
        )}

        {/* ── About Us Page ── */}
        {activeTab === "about" && (
          <AboutUsTab form={form} set={set} token={token} settings={settings} fetchSettings={fetchSettings} mediaUrl={mediaUrl} uploadLogo={uploadLogo} deleteSettingImage={deleteSettingImage} />
        )}

        {/* ── Navigation: nav links manager ── */}
        {activeTab === "navigation" && <NavigationTab />}

        {/* ── Pages: custom pages CRUD ── */}
        {activeTab === "pages" && <PagesTab />}

        {/* ── Shop: shop settings + contact + social ── */}
        {activeTab === "shop" && (
          <div className="space-y-6">
            <ShopTab form={form} set={set} />
            <ContactTab form={form} set={set} />
          </div>
        )}

        {/* ── Appearance: design studio + fonts + icons + CSS ── */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <DesignStudioTab    form={form} set={set} />
            <TypographySizesTab form={form} set={set} />
            <ImageSizesTab      form={form} set={set} />
            <IconsTab           form={form} set={set} />
            <CustomCSSTab       form={form} set={set} />
          </div>
        )}

        {/* ── Reviews ── */}
        {activeTab === "reviews" && <ReviewsTab settings={settings} token={token} fetchSettings={fetchSettings} />}

        {/* ── Advanced ── */}
        {activeTab === "advanced" && <AdvancedTab form={form} set={set} token={token} settings={settings} fetchSettings={fetchSettings} mediaUrl={mediaUrl} />}
      </motion.div>

      {/* SAVE BUTTON (bottom) */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-gold" style={{ padding: "14px 32px" }}>
          {saving ? "Saving..." : <><FiSave /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
}

function ControlCenterTab({ form, set, applyPreset, onSaveLocalBackup, onRestoreLocalBackup }) {
  const [jsonEditor, setJsonEditor] = useState("");
  const [prevForm, setPrevForm] = useState(null);
  const [newColumnHeading, setNewColumnHeading] = useState("");
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [newSectionId, setNewSectionId] = useState("");

  if (form !== prevForm) {
    const cleaned = { ...form };
    delete cleaned._id;
    delete cleaned.__v;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    setJsonEditor(JSON.stringify(cleaned, null, 2));
    setPrevForm(form);
  }

  const quickPresets = [
    {
      name: "High Conversion",
      patch: {
        showHero: true,
        showFeatured: true,
        showStats: true,
        showReviews: true,
        showNewsletter: true,
        popupEnabled: true,
        whatsappFloatEnabled: true,
      },
    },
    {
      name: "Minimal Brand",
      patch: {
        showStats: false,
        showReviews: false,
        showNewsletter: false,
        popupEnabled: false,
        whatsappFloatEnabled: true,
      },
    },
    {
      name: "Maintenance Safe",
      patch: {
        maintenanceMode: true,
        popupEnabled: false,
        whatsappFloatEnabled: false,
      },
    },
  ];

  const toggleGroups = [
    { label: "Hero Section", field: "showHero" },
    { label: "Stats Bar", field: "showStats" },
    { label: "Featured Products", field: "showFeatured" },
    { label: "Brand Story", field: "showBrandStory" },
    { label: "Reviews", field: "showReviews" },
    { label: "Newsletter", field: "showNewsletter" },
    { label: "Promo Popup", field: "popupEnabled" },
    { label: "WhatsApp Float", field: "whatsappFloatEnabled" },
    { label: "Maintenance Mode", field: "maintenanceMode" },
    { label: "Coming Soon", field: "isComingSoon" },
  ];

  const completionItems = [
    form.brandName,
    form.phone,
    form.whatsapp,
    form.email,
    form.logoImage,
    form.siteTitle,
  ];
  const completeCount = completionItems.filter(Boolean).length;
  const completionPct = Math.round((completeCount / completionItems.length) * 100);
  const footerColumns = Array.isArray(form.footerColumns) ? form.footerColumns : [];
  const sectionOrder = Array.isArray(form.sectionOrder) ? form.sectionOrder : [];

  const applyJsonEditor = () => {
    try {
      const parsed = JSON.parse(jsonEditor);
      Object.entries(parsed).forEach(([k, v]) => set(k, v));
      toast.success("Full JSON settings apply ho gayi. Save Changes karo.");
    } catch {
      toast.error("JSON invalid hai");
    }
  };

  const resetJsonEditor = () => {
    const cleaned = { ...form };
    delete cleaned._id;
    delete cleaned.__v;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    setJsonEditor(JSON.stringify(cleaned, null, 2));
    toast.success("Editor reset ho gaya");
  };

  const updateFooterColumn = (idx, patch) => {
    const next = [...footerColumns];
    next[idx] = { ...next[idx], ...patch };
    set("footerColumns", next);
  };

  const addFooterColumn = () => {
    if (!newColumnHeading.trim()) return toast.error("Column heading likho");
    const next = [...footerColumns, { heading: newColumnHeading.trim(), links: [] }];
    set("footerColumns", next);
    setNewColumnHeading("");
  };

  const deleteFooterColumn = (idx) => {
    const next = footerColumns.filter((_, i) => i !== idx);
    set("footerColumns", next);
  };

  const addFooterLink = (idx) => {
    const next = [...footerColumns];
    const links = Array.isArray(next[idx]?.links) ? next[idx].links : [];
    next[idx] = { ...next[idx], links: [...links, { label: "New Link", url: "/" }] };
    set("footerColumns", next);
  };

  const updateFooterLink = (colIdx, linkIdx, patch) => {
    const next = [...footerColumns];
    const links = Array.isArray(next[colIdx]?.links) ? [...next[colIdx].links] : [];
    links[linkIdx] = { ...(links[linkIdx] || {}), ...patch };
    next[colIdx] = { ...next[colIdx], links };
    set("footerColumns", next);
  };

  const deleteFooterLink = (colIdx, linkIdx) => {
    const next = [...footerColumns];
    const links = Array.isArray(next[colIdx]?.links) ? next[colIdx].links.filter((_, i) => i !== linkIdx) : [];
    next[colIdx] = { ...next[colIdx], links };
    set("footerColumns", next);
  };

  const moveSection = (idx, dir) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= sectionOrder.length) return;
    const next = [...sectionOrder];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    set("sectionOrder", next);
  };

  const updateSection = (idx, patch) => {
    const next = [...sectionOrder];
    next[idx] = { ...next[idx], ...patch };
    set("sectionOrder", next);
  };

  const addSection = () => {
    if (!newSectionId.trim() || !newSectionLabel.trim()) return toast.error("Section ID aur label dono required hain");
    const next = [
      ...sectionOrder,
      { id: newSectionId.trim(), label: newSectionLabel.trim(), isVisible: true },
    ];
    set("sectionOrder", next);
    setNewSectionId("");
    setNewSectionLabel("");
  };

  const deleteSection = (idx) => {
    const next = sectionOrder.filter((_, i) => i !== idx);
    set("sectionOrder", next);
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle title="Control Center" desc="Fast admin operations — one-click presets, quick visibility control, emergency backup." />
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm">Setup Completion</p>
            <span className="text-[#c9a84c] font-semibold text-sm">{completionPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
            <div className="h-full gold-gradient transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="One-Click Presets" desc="Business mode ke hisaab se settings apply karo, phir Save Changes karo." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.patch, preset.name)}
              className="text-left p-4 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#c9a84c]/40 transition-all"
            >
              <p className="text-white font-medium text-sm">{preset.name}</p>
              <p className="text-[#444] text-xs mt-1">Apply preset</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Quick Global Toggles" desc="Website ke important blocks on/off yahin se manage karo." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {toggleGroups.map((item) => {
            const enabled = form[item.field] !== false;
            return (
              <div key={item.field} className="flex items-center justify-between p-3 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]">
                <p className="text-white text-sm">{item.label}</p>
                <button
                  onClick={() => set(item.field, !enabled)}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{ background: enabled ? "#c9a84c" : "#1a1a1a" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                    style={{ left: enabled ? "calc(100% - 22px)" : 2, background: enabled ? "#000" : "#555" }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Backup & Recovery" desc="Purana setup safe rakho — local backup save/restore." />
        <div className="flex flex-wrap gap-3">
          <button onClick={onSaveLocalBackup} className="btn-outline" style={{ padding: "10px 18px", fontSize: "0.82rem" }}>
            Save Local Backup
          </button>
          <button onClick={onRestoreLocalBackup} className="btn-outline" style={{ padding: "10px 18px", fontSize: "0.82rem" }}>
            Restore Local Backup
          </button>
        </div>
        <p className="text-[#444] text-xs">Tip: Backup restore ke baad upar se Save Changes press karna zaroori hai.</p>
      </Card>

      <Card>
        <SectionTitle title="Footer Columns Manager" desc="Footer ke columns aur links add/edit/delete yahin se." />
        <div className="space-y-3">
          {footerColumns.map((col, colIdx) => (
            <div key={colIdx} className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] space-y-3">
              <div className="flex gap-2">
                <input
                  value={col.heading || ""}
                  onChange={(e) => updateFooterColumn(colIdx, { heading: e.target.value })}
                  className="lux-input"
                  placeholder="Column heading"
                />
                <button onClick={() => addFooterLink(colIdx)} className="btn-outline" style={{ padding: "8px 10px", fontSize: "0.78rem" }}>+ Link</button>
                <button onClick={() => deleteFooterColumn(colIdx)} className="btn-outline" style={{ padding: "8px 10px", fontSize: "0.78rem", color: "#f87171" }}>Delete</button>
              </div>
              <div className="space-y-2">
                {(Array.isArray(col.links) ? col.links : []).map((link, linkIdx) => (
                  <div key={linkIdx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      value={link.label || ""}
                      onChange={(e) => updateFooterLink(colIdx, linkIdx, { label: e.target.value })}
                      className="lux-input"
                      placeholder="Label"
                    />
                    <input
                      value={link.url || ""}
                      onChange={(e) => updateFooterLink(colIdx, linkIdx, { url: e.target.value })}
                      className="lux-input"
                      placeholder="/page-url"
                    />
                    <button onClick={() => deleteFooterLink(colIdx, linkIdx)} className="btn-outline" style={{ padding: "8px 10px", fontSize: "0.78rem", color: "#f87171" }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newColumnHeading}
              onChange={(e) => setNewColumnHeading(e.target.value)}
              className="lux-input"
              placeholder="New footer column heading"
            />
            <button onClick={addFooterColumn} className="btn-outline" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>Add Column</button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Section Order Manager" desc="Homepage sections reorder/show/hide + custom section add." />
        <div className="space-y-2">
          {sectionOrder.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center">
              <input
                value={item.id || ""}
                onChange={(e) => updateSection(idx, { id: e.target.value })}
                className="lux-input"
                placeholder="section-id"
              />
              <input
                value={item.label || ""}
                onChange={(e) => updateSection(idx, { label: e.target.value })}
                className="lux-input"
                placeholder="Section Label"
              />
              <button
                onClick={() => updateSection(idx, { isVisible: item.isVisible !== false ? false : true })}
                className="btn-outline"
                style={{ padding: "8px 10px", fontSize: "0.78rem" }}
              >
                {item.isVisible !== false ? "Visible" : "Hidden"}
              </button>
              <div className="flex gap-1">
                <button onClick={() => moveSection(idx, -1)} className="btn-outline" style={{ padding: "8px 10px", fontSize: "0.78rem" }}>▲</button>
                <button onClick={() => moveSection(idx, 1)} className="btn-outline" style={{ padding: "8px 10px", fontSize: "0.78rem" }}>▼</button>
              </div>
              <button onClick={() => deleteSection(idx)} className="btn-outline" style={{ padding: "8px 10px", fontSize: "0.78rem", color: "#f87171" }}>Delete</button>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input value={newSectionId} onChange={(e) => setNewSectionId(e.target.value)} className="lux-input" placeholder="new-section-id" />
            <input value={newSectionLabel} onChange={(e) => setNewSectionLabel(e.target.value)} className="lux-input" placeholder="New Section Label" />
            <button onClick={addSection} className="btn-outline" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>Add Section</button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Full JSON Control" desc="Har field ka raw control. Expert mode." />
        <div className="bg-yellow-900/10 border border-yellow-700/20 rounded-xl p-3">
          <p className="text-yellow-400 text-xs">Warning: Invalid JSON ya wrong values se layout affect ho sakta hai. Save se pehle review karein.</p>
        </div>
        <textarea
          value={jsonEditor}
          onChange={(e) => setJsonEditor(e.target.value)}
          rows={18}
          spellCheck={false}
          className="w-full text-sm font-mono rounded-2xl"
          style={{ background: "#050505", border: "1px solid #1a1a1a", padding: 16, outline: "none", resize: "vertical", color: "#60a5fa", lineHeight: 1.55 }}
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={applyJsonEditor} className="btn-gold" style={{ padding: "10px 16px", fontSize: "0.82rem" }}>Apply JSON to Form</button>
          <button onClick={resetJsonEditor} className="btn-outline" style={{ padding: "10px 16px", fontSize: "0.82rem" }}>Reset Editor</button>
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════
   IMAGES TAB
════════════════════════════════════════ */
function ImagesTab({ token, settings, uploadHeroImages, deleteHeroImage, uploadBrandImage, uploadLogo, deleteSettingImage, form, set, fetchSettings, mediaUrl }) {
  const heroInputRef   = useRef(null);
  const brandInputRef  = useRef(null);
  const logoInputRef   = useRef(null);
  const mobileLogoRef  = useRef(null);
  const [heroUploading,   setHeroUploading]   = useState(false);
  const [brandUploading,  setBrandUploading]  = useState(false);
  const [logoUploading,   setLogoUploading]   = useState(false);
  const [mLogoUploading,  setMLogoUploading]  = useState(false);
  const [heroDragging,    setHeroDragging]    = useState(false);

  const handleHeroFiles = useCallback(async (files) => {
    if (!files?.length) return;
    setHeroUploading(true);
    try {
      const res = await uploadHeroImages(Array.from(files), token);
      if (res.success) toast.success(`${files.length} hero image(s) uploaded!`);
      else toast.error("Upload failed");
    } catch { toast.error("Upload error"); }
    finally { setHeroUploading(false); }
  }, [uploadHeroImages, token]);

  const handleDeleteHero = async (path) => {
    if (!window.confirm("Delete this hero image?")) return;
    try {
      const res = await deleteHeroImage(path, token);
      if (res.success) toast.success("Image deleted");
    } catch { toast.error("Delete failed"); }
  };

  const handleDeleteBrand = async () => {
    if (!window.confirm("Brand image delete karein?")) return;
    try {
      const res = await deleteSettingImage("brandImage", token);
      if (res.success) { toast.success("Brand image delete ho gayi"); fetchSettings?.(); }
    } catch { toast.error("Delete failed"); }
  };

  const handleBrandImage = async (file) => {
    if (!file) return;
    setBrandUploading(true);
    try {
      const res = await uploadBrandImage(file);
      if (res.success) toast.success("Brand image updated!");
    } catch { toast.error("Upload failed"); }
    finally { setBrandUploading(false); }
  };

  const handleLogo = async (file) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const res = await uploadLogo(file);
      if (res.success) toast.success("Logo updated!");
    } catch { toast.error("Upload failed"); }
    finally { setLogoUploading(false); }
  };

  // Mobile logo upload — same route as desktop but with field param
  const handleMobileLogo = async (file) => {
    if (!file) return;
    setMLogoUploading(true);
    try {
      const res = await uploadLogo(file, "logoMobileImage");
      if (res.success) { toast.success("Mobile logo updated!"); }
      else toast.error("Upload failed");
    } catch { toast.error("Upload error"); }
    finally { setMLogoUploading(false); }
  };

  const handleDeleteLogo = async (field, label) => {
    if (!window.confirm(`${label} delete karein?`)) return;
    try {
      const res = await deleteSettingImage(field, token);
      if (res.success) { toast.success(`${label} delete ho gaya`); fetchSettings?.(); }
    } catch { toast.error("Delete failed"); }
  };

  const handleDeleteFavicon = async () => {
    if (!window.confirm("Favicon delete karein?")) return;
    try {
      const res = await deleteSettingImage("faviconUrl", token);
      if (res.success) { toast.success("Favicon delete ho gaya"); fetchSettings?.(); }
    } catch { toast.error("Delete failed"); }
  };

  const heroImages = settings?.heroImages || [];

  return (
    <div className="space-y-8">

      {/* ── HERO BANNER IMAGES ── */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#111] flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FiImage className="text-[#c9a84c]" /> Hero Banner Images
            </h3>
            <p className="text-[#444] text-xs mt-0.5">
              Homepage ka hero section — multiple slides ke liye multiple images upload karo
            </p>
          </div>
          <span className="badge-gold">{heroImages.length}/5 images</span>
        </div>

        <div className="p-6 space-y-5">
          {/* DROP ZONE */}
          {heroImages.length < 5 && (
            <div
              onDragEnter={() => setHeroDragging(true)}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setHeroDragging(false)}
              onDrop={(e) => { e.preventDefault(); setHeroDragging(false); handleHeroFiles(e.dataTransfer.files); }}
              onClick={() => heroInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                heroDragging
                  ? "border-[#c9a84c] bg-[rgba(201,168,76,0.05)]"
                  : "border-[#1a1a1a] hover:border-[#c9a84c]/40 hover:bg-[rgba(201,168,76,0.02)]"
              }`}
            >
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleHeroFiles(e.target.files)}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-colors ${heroDragging ? "border-[#c9a84c] text-[#c9a84c]" : "border-[#1a1a1a] text-[#333]"}`}>
                  {heroUploading ? (
                    <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiUpload size={24} />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {heroUploading ? "Uploading..." : heroDragging ? "Drop here!" : "Click or Drag to Upload"}
                  </p>
                  <p className="text-[#444] text-sm mt-1">PNG, JPG, WebP — Max 5MB each</p>
                  <p className="text-[#333] text-xs mt-1">Recommended: 1920×1080 or wider (landscape)</p>
                </div>
              </div>
            </div>
          )}

          {/* HERO IMAGE GRID */}
          {heroImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {heroImages.map((img, i) => (
                  <motion.div
                    key={img}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative rounded-xl overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]"
                  >
                    <div className="aspect-video">
                      <img
                        src={mediaUrl(img)}
                        alt={`Hero ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>

                    {/* OVERLAY on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteHero(img)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>

                    {/* BADGES */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {i === 0 && (
                        <span className="gold-gradient text-black text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FiStar size={9} /> Main
                        </span>
                      )}
                      <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md">Slide {i + 1}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {heroImages.length === 0 && !heroUploading && (
            <p className="text-center text-[#333] text-sm py-4">
              Koi hero image nahi — fallback default image use ho rahi hai
            </p>
          )}
        </div>
      </div>

      {/* ── BRAND STORY IMAGE ── */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#111]">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiImage className="text-[#c9a84c]" /> Brand Story Image
          </h3>
          <p className="text-[#444] text-xs mt-0.5">Homepage ke "Our Story" section mein dikhi hai</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* CURRENT */}
            <div>
              <p className="text-[#555] text-xs uppercase tracking-wider mb-3">Current Image</p>
              <div className="relative group aspect-4/5 rounded-xl overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
                {settings?.brandImage ? (
                  <>
                    <img
                      src={mediaUrl(settings.brandImage)}
                      alt="Brand Story"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    {/* Delete overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={handleDeleteBrand}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2"
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#222]">
                    <FiImage size={36} />
                  </div>
                )}
              </div>
            </div>

            {/* UPLOAD */}
            <div className="space-y-4">
              <p className="text-[#555] text-xs uppercase tracking-wider">Upload New</p>
              <input
                ref={brandInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBrandImage(e.target.files[0])}
              />
              <button
                onClick={() => brandInputRef.current?.click()}
                disabled={brandUploading}
                className="btn-outline w-full flex items-center gap-2"
                style={{ width: "100%", padding: "14px" }}
              >
                {brandUploading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : <FiUpload size={15} />}
                {brandUploading ? "Uploading..." : "Choose Image"}
              </button>
              <p className="text-[#333] text-xs">Recommended: 800×1000px portrait</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOGO ── */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#111]">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiImage className="text-[#c9a84c]" /> Logo Settings
          </h3>
          <p className="text-[#444] text-xs mt-0.5">Navbar aur Footer mein dikhi hai — desktop aur mobile ke liye alag logos</p>
        </div>

        <div className="p-6 space-y-6">

          {/* MAIN LOGO (DESKTOP) */}
          <div>
            <p className="text-xs text-[#555] uppercase tracking-wider mb-3">🖥️ Desktop / Main Logo</p>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="relative group w-20 h-20 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center overflow-hidden shrink-0">
                {settings?.logoImage ? (
                  <>
                    <img src={mediaUrl(settings.logoImage)} alt="Logo"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteLogo("logoImage", "Desktop Logo")}
                        className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500"
                        title="Delete logo"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="font-display font-bold gold-text text-2xl">U</span>
                )}
              </div>
              <div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleLogo(e.target.files[0])} />
                <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                  className="btn-outline flex items-center gap-2" style={{ padding: "10px 20px", fontSize: "0.82rem" }}>
                  {logoUploading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FiUpload size={14} />}
                  {logoUploading ? "Uploading..." : "Upload Desktop Logo"}
                </button>
                <p className="text-[#333] text-xs mt-2">PNG transparent preferred • min 100×100px</p>
              </div>
            </div>
          </div>

          {/* MOBILE LOGO */}
          <div className="border-t border-[#111] pt-5">
            <p className="text-xs text-[#555] uppercase tracking-wider mb-1">📱 Mobile Logo <span className="normal-case text-[#333]">(choti screen)</span></p>
            <p className="text-[#333] text-xs mb-3">Khali rakhne par desktop wala hi use hoga</p>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="relative group w-16 h-16 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center overflow-hidden shrink-0">
                {settings?.logoMobileImage ? (
                  <>
                    <img src={mediaUrl(settings.logoMobileImage)} alt="Mobile Logo"
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteLogo("logoMobileImage", "Mobile Logo")}
                        className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500"
                        title="Delete mobile logo"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="text-[#333] text-xs text-center">Same as desktop</span>
                )}
              </div>
              <div>
                <input ref={mobileLogoRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleMobileLogo(e.target.files[0])} />
                <button onClick={() => mobileLogoRef.current?.click()} disabled={mLogoUploading}
                  className="btn-outline flex items-center gap-2" style={{ padding: "10px 20px", fontSize: "0.82rem" }}>
                  {mLogoUploading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FiUpload size={14} />}
                  {mLogoUploading ? "Uploading..." : "Upload Mobile Logo"}
                </button>
                <p className="text-[#333] text-xs mt-2">Square icon ya simplified version • min 64×64px</p>
              </div>
            </div>
          </div>

          {/* LOGO SIZES */}
          {form && set && (
            <div className="border-t border-[#111] pt-5 space-y-5">
              <p className="text-xs text-[#555] uppercase tracking-wider">📐 Logo Sizes</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Navbar (Desktop)", field: "navLogoSize",       min: 20, max: 72, def: 36 },
                  { label: "Navbar (Mobile)",  field: "navLogoMobileSize", min: 18, max: 56, def: 32 },
                  { label: "Footer Logo",      field: "footerLogoSize",    min: 24, max: 80, def: 44 },
                ].map(({ label, field, min, max, def }) => (
                  <div key={field} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm">{label}</p>
                      <span className="text-[#c9a84c] font-mono text-sm font-bold">{form[field] || def}px</span>
                    </div>
                    <input type="range" min={min} max={max}
                      value={form[field] || def}
                      onChange={(e) => set(field, e.target.value)}
                      className="w-full" style={{ accentColor: "#c9a84c" }} />
                    <div className="flex justify-between text-[#333] text-xs mt-1">
                      <span>{min}px</span><span>{max}px</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* BRAND NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm">Nav Title Size</p>
                    <span className="text-[#c9a84c] font-mono text-sm font-bold">{form.navTitleSize || 18}px</span>
                  </div>
                  <input type="range" min={12} max={28} value={form.navTitleSize || 18}
                    onChange={(e) => set("navTitleSize", e.target.value)}
                    className="w-full" style={{ accentColor: "#c9a84c" }} />
                  <p className="text-[#333] text-xs mt-1">Navbar mein brand name ka font size</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
                  <div>
                    <p className="text-white text-sm">Show Brand Name Text</p>
                    <p className="text-[#444] text-xs mt-0.5">Navbar mein logo ke sath text dikhao</p>
                  </div>
                  <button onClick={() => set("showBrandName", !(form.showBrandName !== false))}
                    className="w-12 h-6 rounded-full transition-all relative shrink-0"
                    style={{ background: (form.showBrandName !== false) ? "#c9a84c" : "#1a1a1a" }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                      style={{ left: (form.showBrandName !== false) ? "calc(100% - 22px)" : 2,
                               background: (form.showBrandName !== false) ? "#000" : "#555" }} />
                  </button>
                </div>
              </div>

              {/* LIVE PREVIEW */}
              <div className="bg-[#050505] border border-[#111] rounded-xl p-4">
                <p className="text-[#555] text-xs uppercase tracking-wider mb-3">👁️ Navbar Preview</p>
                <div className="flex items-center gap-3 bg-[#0a0a0a] px-4 py-3 rounded-xl border border-[#1a1a1a]">
                  <div className="rounded-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center shrink-0"
                    style={{ width: form.navLogoSize || 36, height: form.navLogoSize || 36 }}>
                    {settings?.logoImage
                      ? <img src={mediaUrl(settings.logoImage)} className="w-full h-full object-contain" />
                      : <span className="text-black font-bold font-display gold-gradient w-full h-full flex items-center justify-center"
                          style={{ fontSize: Math.max(10, (form.navLogoSize||36)*0.44) }}>U</span>}
                  </div>
                  {(form.showBrandName !== false) && (
                    <span className="font-display font-bold text-white tracking-widest"
                      style={{ fontSize: form.navTitleSize || 18 }}>
                      {(settings?.brandName || "URBAN THREAD").split(" ")[0]}
                      <span className="gold-text"> {(settings?.brandName || "URBAN THREAD").split(" ").slice(1).join(" ")}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SITE TITLE & FAVICON ── */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#111]">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiGlobe className="text-[#c9a84c]" /> Browser Tab — Title & Icon
          </h3>
          <p className="text-[#444] text-xs mt-0.5">Browser mein tab par jo naam aur icon dikhe — admin se control karo</p>
        </div>
        <div className="p-6 space-y-5">

          {/* SITE TITLE */}
          {form && set && (
            <div>
              <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">
                Tab Title (document.title)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    value={form.siteTitle || ""}
                    onChange={(e) => set("siteTitle", e.target.value)}
                    placeholder="URBAN THREAD"
                    className="lux-input pr-24"
                  />
                </div>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-3 py-2 flex items-center gap-2 shrink-0">
                  <span className="text-[#c9a84c] text-xs">🌐</span>
                  <span className="text-[#9a9a9a] text-xs font-mono truncate max-w-30">
                    {form.siteTitle || "URBAN THREAD"}
                  </span>
                </div>
              </div>
              <p className="text-[#333] text-xs mt-2">
                Yeh browser tab mein dikhega — short aur descriptive rakho
              </p>
            </div>
          )}

          {/* FAVICON */}
          <div className="border-t border-[#111] pt-5">
            <p className="text-xs text-[#555] uppercase tracking-wider mb-3">
              🌐 Favicon (Tab Icon)
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              {/* Current favicon preview */}
              <div className="w-16 h-16 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center overflow-hidden shrink-0">
                {settings?.faviconUrl ? (
                  <img
                    src={mediaUrl(settings.faviconUrl)}
                    alt="Favicon"
                    className="w-10 h-10 object-contain"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : settings?.logoImage ? (
                  <img
                    src={mediaUrl(settings.logoImage)}
                    alt="Favicon (from logo)"
                    className="w-10 h-10 object-contain"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <span className="font-display font-bold gold-text text-2xl">U</span>
                )}
              </div>

              <div className="flex-1 min-w-50">
                <FaviconUploader token={token} fetchSettings={fetchSettings} settings={settings} onDelete={handleDeleteFavicon} />
                <p className="text-[#333] text-xs mt-2">
                  ICO, PNG, or SVG • Recommended: 32×32px or 64×64px<br />
                  <span className="text-[#222]">Khali rakhne par logo image use hogi</span>
                </p>
              </div>
            </div>

            {/* Browser tab mockup */}
            <div className="mt-4 bg-[#050505] border border-[#111] rounded-xl p-4">
              <p className="text-[#333] text-xs uppercase tracking-wider mb-3">Preview</p>
              <div className="flex items-center gap-0 max-w-xs">
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-t-lg px-3 py-2 text-xs text-[#9a9a9a] border-b-transparent">
                  {settings?.faviconUrl ? (
                    <img src={mediaUrl(settings.faviconUrl)} className="w-3.5 h-3.5 object-contain" />
                  ) : settings?.logoImage ? (
                    <img src={mediaUrl(settings.logoImage)} className="w-3.5 h-3.5 object-contain" />
                  ) : (
                    <span className="w-3 h-3 rounded-sm gold-gradient inline-block" />
                  )}
                  <span className="truncate max-w-25">{form?.siteTitle || settings?.brandName || "URBAN THREAD"}</span>
                </div>
                <div className="h-px flex-1 bg-[#333]" />
              </div>
              <div className="bg-[#111] border border-[#333] border-t-0 rounded-b-lg rounded-tr-lg px-3 py-2">
                <div className="h-2 bg-[#1a1a1a] rounded w-32 mb-1.5" />
                <div className="h-1.5 bg-[#151515] rounded w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   ADVANCED TAB — Pro Level Controls
════════════════════════════════════════ */
function AdvancedTab({ form, set, token, settings, fetchSettings, mediaUrl }) {
  const popupRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handlePopupImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("field", "popupImage");
      const res = await api.post("/settings/logo", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success("Popup image uploaded!");
        fetchSettings?.();
      } else toast.error("Upload failed");
    } catch { toast.error("Upload error"); }
    finally { setUploading(false); }
  };

  const deletePopupImage = async () => {
    if (!window.confirm("Popup image delete karein?")) return;
    try {
      const res = await api.post("/settings/delete-image", { field: "popupImage" });
      if (res.data.success) {
        toast.success("Popup image deleted");
        fetchSettings?.();
      }
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      {/* MAINTENANCE MODE */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <SectionTitle title="Maintenance Mode" desc="Website ko temporary down karein, sirf admin login access kar sakega." />
          </div>
          <button onClick={() => set("maintenanceMode", !form.maintenanceMode)}
            className="w-12 h-6 rounded-full transition-all relative shrink-0"
            style={{ background: form.maintenanceMode ? "#ef4444" : "#1a1a1a" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.maintenanceMode ? "calc(100% - 22px)" : 2, background: form.maintenanceMode ? "#000" : "#555" }} />
          </button>
        </div>
        {form.maintenanceMode && (
          <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-red-400 text-xs mt-4">
            ⚠️ Maintenance mode is ON. Normal users cannot access the website.
          </div>
        )}
      </Card>

      {/* COMING SOON / LAUNCH TIMER */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <SectionTitle title="Coming Soon / Launch Timer" desc="Website ko 'Coming Soon' mode me dalen aur ek launch date set karen." />
          </div>
          <button onClick={() => set("isComingSoon", !form.isComingSoon)}
            className="w-12 h-6 rounded-full transition-all relative shrink-0"
            style={{ background: form.isComingSoon ? "#c9a84c" : "#1a1a1a" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.isComingSoon ? "calc(100% - 22px)" : 2, background: form.isComingSoon ? "#000" : "#555" }} />
          </button>
        </div>
        {form.isComingSoon && (
          <div className="mt-4 pt-4 border-t border-[#111]">
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Launch Date & Time</label>
            <input 
              type="datetime-local" 
              value={form.launchDate ? new Date(form.launchDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => set("launchDate", e.target.value)}
              className="lux-input w-full sm:w-auto"
            />
            <p className="text-[#444] text-xs mt-2">Jab yeh waqt aayega, countdown zero ho jayega. Is se pehle users site nahi dekh sakte.</p>
          </div>
        )}
      </Card>

      {/* CURRENCY & GLOBALS */}
      <Card>
        <SectionTitle title="Global Settings" desc="Currency aur global variables configure karein." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Currency Symbol" field="currencySymbol" form={form} set={set} placeholder="Rs." hint="e.g. Rs., $, £, €" />
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Currency Position</label>
            <select value={form.currencyPosition || "left"} onChange={(e) => set("currencyPosition", e.target.value)} className="lux-select w-full">
              <option value="left">Left (e.g. Rs. 1000)</option>
              <option value="right">Right (e.g. 1000 Rs.)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* FLOATING ACTION BUTTONS */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <SectionTitle title="WhatsApp Float Button" desc="Har page ke bottom right par WhatsApp button dikhayein." />
          </div>
          <button onClick={() => set("whatsappFloatEnabled", form.whatsappFloatEnabled !== false ? false : true)}
            className="w-12 h-6 rounded-full transition-all relative shrink-0"
            style={{ background: form.whatsappFloatEnabled !== false ? "#25D366" : "#1a1a1a" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.whatsappFloatEnabled !== false ? "calc(100% - 22px)" : 2, background: form.whatsappFloatEnabled !== false ? "#000" : "#555" }} />
          </button>
        </div>
      </Card>

      {/* PROMOTIONAL POPUP */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionTitle title="Promotional Popup" desc="User ke first visit par popup dikhayein." />
          </div>
          <button onClick={() => set("popupEnabled", !form.popupEnabled)}
            className="w-12 h-6 rounded-full transition-all relative shrink-0"
            style={{ background: form.popupEnabled ? "#c9a84c" : "#1a1a1a" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.popupEnabled ? "calc(100% - 22px)" : 2, background: form.popupEnabled ? "#000" : "#555" }} />
          </button>
        </div>

        {form.popupEnabled && (
          <div className="space-y-4 pt-4 border-t border-[#111]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Popup Title" field="popupTitle" form={form} set={set} placeholder="Special Offer!" />
              <Field label="Button Link" field="popupCtaLink" form={form} set={set} placeholder="/shop" />
              <div className="sm:col-span-2">
                <Field label="Popup Text" field="popupText" form={form} set={set} rows={2} placeholder="Get 20% off on your first order!" />
              </div>
              <Field label="Button Text" field="popupCtaText" form={form} set={set} placeholder="Shop Now" />
            </div>

            <div className="border-t border-[#111] pt-4">
              <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Popup Image (Optional)</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden shrink-0">
                  {settings?.popupImage ? (
                    <img src={mediaUrl(settings.popupImage)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#222]"><FiImage size={24} /></div>
                  )}
                </div>
                <div>
                  <input ref={popupRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePopupImage(e.target.files[0])} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => popupRef.current?.click()} disabled={uploading} className="btn-outline flex items-center gap-2 text-xs" style={{ padding: "8px 12px" }}>
                      {uploading ? "Uploading..." : <><FiUpload size={12} /> Upload Image</>}
                    </button>
                    {settings?.popupImage && (
                      <button onClick={deletePopupImage} className="text-red-400 text-xs px-2 hover:text-red-300"><FiTrash2 size={12} /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* SEO META */}
      <Card>
        <SectionTitle title="SEO Configuration" desc="Search engine optimization for your store." />
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                set("defaultMetaDesc", "Pakistan ka premium streetwear brand. Fast delivery across Lahore, Karachi, Islamabad, Rawalpindi aur poore Pakistan.");
                set("metaKeywords", "pakistani fashion, pakistan streetwear, online clothing pakistan, lahore fashion brand, cod pakistan");
                set("seoLocale", "en_PK");
                set("seoGeoRegion", "PK-PB");
                set("seoGeoPlacename", "Lahore");
                set("seoGeoPosition", "31.5204;74.3587");
                set("seoBrandTagline", "Pakistan ka premium streetwear brand.");
                toast.success("Pakistan SEO preset apply ho gaya");
              }}
              className="btn-outline"
              style={{ padding: "10px 12px", fontSize: "0.82rem" }}
            >
              Apply Pakistan SEO Preset
            </button>
            <button
              onClick={() => {
                set("defaultMetaDesc", "Stylish and affordable Pakistani fashion with cash on delivery and nationwide shipping.");
                set("metaKeywords", "pakistani clothing online, fashion pakistan, cod fashion pakistan, urban style pakistan");
                set("seoLocale", "en_PK");
                set("seoGeoRegion", "PK-SD");
                set("seoGeoPlacename", "Karachi");
                set("seoGeoPosition", "24.8607;67.0011");
                set("seoBrandTagline", "Affordable style for Pakistan.");
                toast.success("Alternate Pakistan preset apply ho gaya");
              }}
              className="btn-outline"
              style={{ padding: "10px 12px", fontSize: "0.82rem" }}
            >
              Apply Karachi SEO Preset
            </button>
          </div>
          <Field label="Default Meta Description" field="defaultMetaDesc" form={form} set={set} rows={2} />
          <Field label="Meta Keywords (comma separated)" field="metaKeywords" form={form} set={set} rows={2} />
          <Field label="Brand SEO Tagline" field="seoBrandTagline" form={form} set={set} placeholder="Pakistan ka premium streetwear brand." />
          <Field label="SEO Locale" field="seoLocale" form={form} set={set} placeholder="en_PK" />
          <Field label="Geo Region" field="seoGeoRegion" form={form} set={set} placeholder="PK-PB" />
          <Field label="Geo Placename" field="seoGeoPlacename" form={form} set={set} placeholder="Lahore" />
          <Field label="Geo Position (lat;long)" field="seoGeoPosition" form={form} set={set} placeholder="31.5204;74.3587" />
          <Field label="Robots Meta" field="seoRobots" form={form} set={set} rows={2} placeholder="index,follow,max-image-preview:large" />
          <Field label="Twitter Handle (optional)" field="seoTwitterHandle" form={form} set={set} placeholder="@yourbrand" />
          <Field label="Default OG Image URL (optional)" field="seoDefaultImage" form={form} set={set} placeholder="https://yourdomain.com/og-image.jpg" />
        </div>
      </Card>

      {/* CUSTOM SCRIPTS */}
      <Card>
        <SectionTitle title="Custom Scripts (Head)" desc="Google Analytics, Facebook Pixel, Tawk.to, etc." />
        <div className="bg-yellow-900/10 border border-yellow-700/20 rounded-xl p-3 mb-4 mt-4">
          <p className="text-yellow-400 text-xs">⚠️ Warning: Invalid scripts can break your website. Paste code carefully.</p>
        </div>
        <textarea value={form.customScripts || ""} onChange={(e) => set("customScripts", e.target.value)}
          rows={6} spellCheck={false}
          placeholder={"<!-- Global site tag (gtag.js) - Google Analytics -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y\"></script>"}
          className="w-full text-sm font-mono rounded-2xl"
          style={{ background: "#050505", border: "1px solid #1a1a1a", padding: 16, outline: "none", resize: "vertical", color: "#60a5fa", lineHeight: 1.5 }}
        />
      </Card>

    </div>
  );
}
/* ════════════════════════════════════════
   FAVICON UPLOADER
════════════════════════════════════════ */
function FaviconUploader({ token, fetchSettings, settings, onDelete }) {
  const faviconRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFavicon = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("field", "faviconUrl");
      const res = await api.post("/settings/favicon", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success("Favicon updated! Refresh karo tab icon dekhne ke liye.");
        fetchSettings && fetchSettings();
      } else toast.error("Upload failed");
    } catch { toast.error("Upload error"); }
    finally { setUploading(false); }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input ref={faviconRef} type="file" accept="image/*,.ico" className="hidden"
        onChange={(e) => handleFavicon(e.target.files[0])} />
      <button onClick={() => faviconRef.current?.click()} disabled={uploading}
        className="btn-outline flex items-center gap-2" style={{ padding: "10px 20px", fontSize: "0.82rem" }}>
        {uploading
          ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          : <FiUpload size={14} />}
        {uploading ? "Uploading..." : "Upload Favicon"}
      </button>
      {settings?.faviconUrl && (
        <>
          <span className="text-[#25d366] text-xs">✓ Custom favicon set</span>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-red-900/30 text-red-400 hover:bg-red-900/10 transition-all"
          >
            <FiTrash2 size={12} /> Delete Favicon
          </button>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   FIELD COMPONENTS
════════════════════════════════════════ */
function Field({ label, field, form, set, type = "text", placeholder, rows, hint }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs text-[#555] uppercase tracking-wider">{label}</label>
      {rows ? (
        <textarea
          value={form[field] || ""}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="lux-input resize-none"
          style={{ resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={form[field] || ""}
          onChange={(e) => set(field, type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          className="lux-input"
        />
      )}
      {hint && <p className="text-[#333] text-xs">{hint}</p>}
    </div>
  );
}

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-1">
      <h3 className="text-white font-semibold">{title}</h3>
      {desc && <p className="text-[#444] text-sm mt-0.5">{desc}</p>}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl p-5 sm:p-6 space-y-5">
      {children}
    </div>
  );
}

/* ── HERO TEXT TAB ── */
function HeroTab({ form, set }) {
  return (
    <Card>
      <SectionTitle title="Hero Banner — Text" desc="Homepage ka main banner text edit karo. Images 'Images' tab mein update karo." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Label (small badge)" field="heroLabel" form={form} set={set} placeholder="New Season 2026" />
        <Field label="CTA Button Text" field="heroCta" form={form} set={set} placeholder="Shop Collection" />
        <Field label="Main Title" field="heroTitle" form={form} set={set} rows={3} placeholder={"Style That\nSpeaks Louder"} hint="Use newline for 2nd line (gold color)" />
        <Field label="Subtitle / Description" field="heroSubtitle" form={form} set={set} rows={3} placeholder="Premium Pakistani streetwear..." />
      </div>
      {/* LIVE PREVIEW */}
      <div className="bg-[#111] rounded-xl p-5 border border-[#1a1a1a] mt-2">
        <p className="text-[#333] text-xs uppercase tracking-wider mb-3">Live Preview</p>
        <span className="section-label text-xs">{form.heroLabel}</span>
        <h3 className="font-display text-2xl font-bold mt-2 whitespace-pre-line">
          {(form.heroTitle || "").split("\n").map((line, i) => (
            <span key={i} className="block">
              {i === 1 ? <span className="gold-text">{line}</span> : line}
            </span>
          ))}
        </h3>
        <p className="text-[#9a9a9a] text-sm mt-2">{form.heroSubtitle}</p>
        <div className="mt-3 inline-block gold-gradient text-black text-xs font-bold px-3 py-1.5 rounded-lg">{form.heroCta}</div>
      </div>
    </Card>
  );
}

/* ── BRAND STORY TEXT TAB ── */
function BrandTab({ form, set }) {
  return (
    <Card>
      <SectionTitle title="Brand Story — Text" desc="'Our Story' section ka text. Image 'Images' tab mein update karo." />
      <Field label="Section Heading" field="brandTitle" form={form} set={set} placeholder="Fashion Born From Pakistani Streets" />
      <Field label="Founded Year" field="brandYear" form={form} set={set} placeholder="2020" />
      <Field label="Paragraph 1" field="brandText1" form={form} set={set} rows={4} />
      <Field label="Paragraph 2" field="brandText2" form={form} set={set} rows={4} />
      <Field label="Footer Tagline" field="footerTagline" form={form} set={set} rows={2} />
    </Card>
  );
}

/* ── SHOP TAB ── */
function ShopTab({ form, set }) {
  return (
    <Card>
      <SectionTitle title="Shop & Pricing" desc="Delivery charges, coupon codes configure karo." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Field label="Delivery Charges (Rs.)" field="deliveryCharges" form={form} set={set} type="number" placeholder="250" />
        <Field label="Coupon Code" field="couponCode" form={form} set={set} placeholder="SAVE10" />
        <Field label="Coupon Discount (Rs.)" field="couponDiscount" form={form} set={set} type="number" placeholder="500" />
      </div>
      <div className="bg-[#111] rounded-xl p-4 border border-[#1a1a1a] text-sm text-[#555]">
        📦 Delivery: <span className="text-[#c9a84c] font-semibold">Rs. {form.deliveryCharges}</span>
        &nbsp;|&nbsp; 🏷️ Code: <span className="text-[#c9a84c] font-semibold">{form.couponCode}</span>
        &nbsp;→&nbsp; saves <span className="text-[#c9a84c] font-semibold">Rs. {form.couponDiscount}</span>
      </div>
    </Card>
  );
}

/* ── CONTACT TAB ── */
function ContactTab({ form, set }) {
  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Contact Information" desc="Footer aur Support page mein dikhi hai." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Phone" field="phone" form={form} set={set} placeholder="+92 300 1234567" />
          <Field label="WhatsApp (digits only)" field="whatsapp" form={form} set={set} placeholder="923001234567" />
          <Field label="Email" field="email" form={form} set={set} type="email" placeholder="info@urbanthread.pk" />
          <Field label="Address" field="address" form={form} set={set} placeholder="Lahore, Pakistan" />
        </div>
      </Card>
      <Card>
        <SectionTitle title="Social Media" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Instagram URL" field="instagram" form={form} set={set} placeholder="https://instagram.com/..." />
          <Field label="Facebook URL"  field="facebook"  form={form} set={set} placeholder="https://facebook.com/..." />
          <Field label="TikTok URL"    field="tiktok"    form={form} set={set} placeholder="https://tiktok.com/@..." />
          <Field label="YouTube URL"   field="youtube"   form={form} set={set} placeholder="https://youtube.com/..." />
        </div>
      </Card>
    </div>
  );
}

/* ── GENERAL TAB ── */
function GeneralTab({ form, set }) {
  return (
    <Card>
      <SectionTitle title="General" desc="Core brand identity." />
      <Field label="Brand Name" field="brandName" form={form} set={set} placeholder="URBAN THREAD" hint="Navbar aur Footer mein use hogi" />
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
        <p className="text-yellow-400 text-sm">
          ⚠️ Brand name change karne ke baad puri website mein update hogi.
        </p>
      </div>
    </Card>
  );
}

/* ════════════════════════════════════════
   HERO SLIDES TAB — Per-slide text + image
════════════════════════════════════════ */
function SlidesTab({ settings, token, fetchSettings, deleteSlideImage, mediaUrl }) {
  const [slides, setSlides] = useState(() => {
    const s = settings?.heroSlides || [];
    while (s.length < 3) s.push({ image: "", label: "", title: "", subtitle: "", cta: "" });
    return s.slice(0, 3);
  });
  const [uploading, setUploading] = useState([false, false, false]);
  const [saving, setSaving] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef()];

  useEffect(() => {
    if (settings?.heroSlides) {
      const s = [...settings.heroSlides];
      while (s.length < 3) s.push({ image: "", label: "", title: "", subtitle: "", cta: "" });
      setSlides(s.slice(0, 3));
    }
  }, [settings]);

  const updateSlide = (idx, key, val) => {
    setSlides((prev) => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  };

  const handleImageUpload = async (idx, file) => {
    if (!file) return;
    setUploading((prev) => { const n = [...prev]; n[idx] = true; return n; });
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("slideIndex", idx);
      const res = await api.post("/settings/slide-image", fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success(`Slide ${idx + 1} image upload ho gayi!`);
        fetchSettings?.();
      } else toast.error("Upload nahi hua");
    } catch { toast.error("Upload error"); }
    finally { setUploading((prev) => { const n = [...prev]; n[idx] = false; return n; }); }
  };

  const handleSaveText = async () => {
    setSaving(true);
    try {
      const res = await api.put("/settings", { heroSlides: slides }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) { toast.success("Slides saved!"); fetchSettings?.(); }
      else toast.error("Save nahi hua");
    } catch { toast.error("Error saving"); }
    finally { setSaving(false); }
  };

  const SLIDE_NAMES = ["Slide 1 — Main", "Slide 2", "Slide 3"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-white font-semibold">Hero Slides — 3 Slides Control</h3>
          <p className="text-[#444] text-sm mt-0.5">Har slide ka image, title aur text alag se set karo</p>
        </div>
        <button onClick={handleSaveText} disabled={saving} className="btn-gold" style={{ padding: "10px 20px", fontSize: "0.82rem" }}>
          {saving ? "Saving..." : <><FiSave size={13} /> Save Slides Text</>}
        </button>
      </div>

      {slides.map((slide, idx) => (
        <div key={idx} className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#111] flex items-center gap-2">
            <span className="gold-gradient text-black text-xs font-bold px-2.5 py-1 rounded-lg">{idx + 1}</span>
            <h4 className="text-white font-semibold text-sm">{SLIDE_NAMES[idx]}</h4>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* IMAGE */}
            <div>
              <p className="text-[#555] text-xs uppercase tracking-wider mb-3">Slide Image</p>
              <div className="aspect-video rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] mb-3 relative">
                {slide.image ? (
                  <img src={mediaUrl(slide.image)} alt={`slide-${idx}`} className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#222]">
                    <FiImage size={28} />
                  </div>
                )}
                {uploading[idx] && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input ref={inputRefs[idx]} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleImageUpload(idx, e.target.files[0])} />
              <button onClick={() => inputRefs[idx].current?.click()} disabled={uploading[idx]}
                className="btn-outline w-full text-xs" style={{ padding: "10px", width: "100%" }}>
                <FiUpload size={12} /> {uploading[idx] ? "Uploading..." : "Image Change Karo"}
              </button>
              {/* Delete slide image */}
              {slide.image && (
                <button
                  onClick={async () => {
                    if (!window.confirm(`Slide ${idx + 1} image delete karein?`)) return;
                    try {
                      const res = await deleteSlideImage(idx, token);
                      if (res.success) { toast.success(`Slide ${idx + 1} image delete ho gayi`); fetchSettings?.(); }
                    } catch { toast.error("Delete nahi hua"); }
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-red-900/30 text-red-400 hover:bg-red-900/10 transition-all"
                  style={{ width: "100%" }}
                >
                  <FiTrash2 size={11} /> Image Delete Karo
                </button>
              )}
            </div>

            {/* TEXT FIELDS */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Badge Label</label>
                <input value={slide.label || ""} onChange={(e) => updateSlide(idx, "label", e.target.value)}
                  placeholder="e.g. New Season 2026" className="lux-input" />
              </div>
              <div>
                <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Button Text (CTA)</label>
                <input value={slide.cta || ""} onChange={(e) => updateSlide(idx, "cta", e.target.value)}
                  placeholder="e.g. Shop Collection" className="lux-input" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Title (newline for gold line)</label>
                <textarea value={slide.title || ""} onChange={(e) => updateSlide(idx, "title", e.target.value)}
                  placeholder={"Style That\nSpeaks Louder"} rows={2}
                  className="lux-input resize-none" style={{ resize: "vertical" }} />
                <p className="text-[#333] text-xs mt-1">💡 Dusri line automatic gold color mein hogi</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Subtitle / Description</label>
                <textarea value={slide.subtitle || ""} onChange={(e) => updateSlide(idx, "subtitle", e.target.value)}
                  placeholder="Pakistan ka premium streetwear..." rows={2}
                  className="lux-input resize-none" style={{ resize: "vertical" }} />
              </div>
              {/* MINI PREVIEW */}
              <div className="sm:col-span-2 bg-[#111] border border-[#1a1a1a] rounded-xl p-3">
                <p className="text-[#333] text-[10px] uppercase tracking-wider mb-2">Preview</p>
                <span className="section-label text-[10px]">{slide.label}</span>
                <h5 className="font-display text-base font-bold mt-1 whitespace-pre-line">
                  {(slide.title || "").split("\n").map((line, i) => (
                    <span key={i} className="block">{i === 1 ? <span className="gold-text">{line}</span> : line}</span>
                  ))}
                </h5>
                <p className="text-[#555] text-xs mt-1">{slide.subtitle}</p>
                <div className="mt-2 inline-block gold-gradient text-black text-[10px] font-bold px-2 py-1 rounded">{slide.cta}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   REVIEWS TAB — Admin manages reviews
════════════════════════════════════════ */
function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <FiStar size={18} className={s <= value ? "fill-[#c9a84c] text-[#c9a84c]" : "text-[#333]"} />
        </button>
      ))}
    </div>
  );
}

function ReviewsTab({ settings, token, fetchSettings }) {
  const reviews = settings?.reviews || [];
  const [form, setForm] = useState({ name: "", city: "", rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const resetForm = () => { setForm({ name: "", city: "", rating: 5, comment: "" }); setEditId(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.comment.trim()) { toast.error("Naam aur comment zaroori hain"); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/settings/reviews/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Review updated!");
      } else {
        await api.post("/settings/reviews", form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Review add ho gaya!");
      }
      fetchSettings?.();
      resetForm();
    } catch { toast.error("Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/settings/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Review delete ho gaya");
      fetchSettings?.();
    } catch { toast.error("Delete nahi hua"); }
  };

  const handleToggle = async (review) => {
    try {
      await api.put(`/settings/reviews/${review._id}`, { ...review, isActive: !review.isActive }, { headers: { Authorization: `Bearer ${token}` } });
      fetchSettings?.();
    } catch { toast.error("Toggle nahi hua"); }
  };

  const startEdit = (r) => {
    setForm({ name: r.name, city: r.city || "", rating: r.rating || 5, comment: r.comment });
    setEditId(r._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      {/* ADD / EDIT FORM */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          {editId ? <><FiEdit2 size={15} className="text-[#c9a84c]" /> Review Edit Karo</> : <><FiPlus size={15} className="text-[#c9a84c]" /> Naya Review Add Karo</>}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Customer Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ahmad Raza" className="lux-input" />
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Lahore" className="lux-input" />
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Rating</label>
            <StarInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Review Comment *</label>
            <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Customer ne kya kaha..." rows={3}
              className="lux-input resize-none" style={{ resize: "vertical" }} />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-gold" style={{ padding: "10px 24px", fontSize: "0.83rem" }}>
            {saving ? "Saving..." : editId ? "Update Review" : "Add Review"}
          </button>
          {editId && (
            <button onClick={resetForm} className="btn-outline" style={{ padding: "10px 20px", fontSize: "0.83rem" }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#111] flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-white font-semibold">All Reviews</h3>
          <div className="flex items-center gap-2">
            {reviews.filter((r) => !r.isActive).length > 0 && (
              <span className="text-xs font-bold text-orange-400 bg-orange-900/15 border border-orange-700/20 px-2.5 py-1 rounded-full">
                ⚡ {reviews.filter((r) => !r.isActive).length} pending
              </span>
            )}
            <span className="badge-gold">{reviews.length} total</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="p-10 text-center text-[#333]">
            <FiMessageSquare size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Koi review nahi abhi — upar se add karo ya user submit kare</p>
          </div>
        ) : (
          <div className="divide-y divide-[#111]">
            {/* Pending first */}
            {[...reviews].sort((a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1)).map((r) => (
              <div key={r._id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${!r.isActive ? "bg-orange-900/5" : ""}`}>
                <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center text-black font-bold font-display shrink-0 text-sm">
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold text-sm">{r.name}</span>
                    <span className="text-[#444] text-xs">{r.city}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <FiStar key={s} size={10} className={s <= r.rating ? "fill-[#c9a84c] text-[#c9a84c]" : "text-[#222] fill-[#222]"} />
                      ))}
                    </div>
                    {!r.isActive && (
                      <span className="text-[9px] font-bold text-orange-400 bg-orange-900/15 border border-orange-700/20 px-1.5 py-0.5 rounded">
                        PENDING
                      </span>
                    )}
                  </div>
                  <p className="text-[#555] text-xs mt-1 line-clamp-2">{r.comment}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {/* APPROVE button for pending */}
                  {!r.isActive && (
                    <button
                      onClick={() => handleToggle(r)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-green-700/40 text-green-400 bg-green-900/15 hover:bg-green-900/30 transition-all"
                    >
                      ✓ Approve
                    </button>
                  )}
                  {r.isActive && (
                    <button
                      onClick={() => handleToggle(r)}
                      className="text-[10px] px-2 py-1 rounded-lg border border-green-700/30 text-green-400 bg-green-900/10 hover:bg-red-900/10 hover:text-red-400 hover:border-red-700/20 transition-all"
                    >
                      Visible
                    </button>
                  )}
                  <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg border border-[#1a1a1a] text-[#444] hover:text-[#c9a84c] transition-all">
                    <FiEdit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg border border-[#1a1a1a] text-[#444] hover:text-red-400 transition-all">
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



/* ----------------------------------------
   ABOUT US TAB
---------------------------------------- */
function AboutUsTab({ form, set, token, uploadLogo, deleteSettingImage, fetchSettings, mediaUrl }) {
  const [uploading, setUploading] = useState({ hero: false, story: false, mission: false });

  const handleImageUpload = async (e, field, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(p => ({ ...p, [type]: true }));
    try {
      const res = await uploadLogo(file, field);
      if (res.success) {
        toast.success("Image uploaded!");
      }
    } catch { toast.error("Upload error"); }
    finally { setUploading(p => ({ ...p, [type]: false })); e.target.value = ""; }
  };

  const handleDeleteImage = async (field) => {
    if (!confirm("Remove this image?")) return;
    try {
      const res = await deleteSettingImage(field, token);
      if (res.success) {
        toast.success("Image removed");
        fetchSettings?.();
      }
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <FiFileText className="text-[#c9a84c]" size={24} />
        <div>
          <h2 className="text-xl font-bold text-white">About Us Page</h2>
          <p className="text-[#555] text-xs">Manage all content and images for your About Us page.</p>
        </div>
      </div>

      <Card>
        <SectionTitle title="Hero Section" desc="Top banner of the About page." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[#555] text-xs mb-1 block">Hero Title</label>
            <input value={form.aboutUsHeroTitle || ""} onChange={e => set("aboutUsHeroTitle", e.target.value)} className="lux-input w-full" placeholder="Our Story" />
          </div>
          <div>
            <label className="text-[#555] text-xs mb-1 block">Hero Subtitle</label>
            <input value={form.aboutUsHeroSubtitle || ""} onChange={e => set("aboutUsHeroSubtitle", e.target.value)} className="lux-input w-full" placeholder="Redefining Streetwear..." />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-[#555] text-xs mb-1 block">Hero Image</label>
          <div className="flex gap-4 items-center">
            {form.aboutUsHeroImage ? (
              <div className="relative group rounded-xl overflow-hidden" style={{ width: 120, height: 80 }}>
                <img src={mediaUrl(form.aboutUsHeroImage)} alt="hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDeleteImage("aboutUsHeroImage")} className="text-white hover:text-red-400 p-2"><FiTrash2 size={16}/></button>
                </div>
              </div>
            ) : (
              <div className="w-[120px] h-[80px] rounded-xl border border-dashed border-[#333] flex items-center justify-center bg-[#111]">
                <FiImage className="text-[#444]" size={24} />
              </div>
            )}
            <div>
              <input type="file" id="aboutHeroImg" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, "aboutUsHeroImage", "hero")} />
              <label htmlFor="aboutHeroImg" className="btn-outline cursor-pointer px-4 py-2 text-xs inline-block">
                {uploading.hero ? "Uploading..." : "Upload Image"}
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Brand Story" desc="The main story component detailing your brand origins." />
        <div className="space-y-4">
          <div>
            <label className="text-[#555] text-xs mb-1 block">Story Title</label>
            <input value={form.aboutUsStoryTitle || ""} onChange={e => set("aboutUsStoryTitle", e.target.value)} className="lux-input w-full" placeholder="How It All Started" />
          </div>
          <div>
            <label className="text-[#555] text-xs mb-1 block">Story Paragraph 1</label>
            <textarea value={form.aboutUsStoryText1 || ""} onChange={e => set("aboutUsStoryText1", e.target.value)} className="lux-input w-full" rows={3} placeholder="We started with..." />
          </div>
          <div>
            <label className="text-[#555] text-xs mb-1 block">Story Paragraph 2</label>
            <textarea value={form.aboutUsStoryText2 || ""} onChange={e => set("aboutUsStoryText2", e.target.value)} className="lux-input w-full" rows={3} placeholder="Our goal is..." />
          </div>
          <div>
            <label className="text-[#555] text-xs mb-1 block">Story Image</label>
            <div className="flex gap-4 items-center">
              {form.aboutUsStoryImage ? (
                <div className="relative group rounded-xl overflow-hidden" style={{ width: 100, height: 100 }}>
                  <img src={mediaUrl(form.aboutUsStoryImage)} alt="story" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDeleteImage("aboutUsStoryImage")} className="text-white hover:text-red-400 p-2"><FiTrash2 size={16}/></button>
                  </div>
                </div>
              ) : (
                <div className="w-[100px] h-[100px] rounded-xl border border-dashed border-[#333] flex items-center justify-center bg-[#111]">
                  <FiImage className="text-[#444]" size={24} />
                </div>
              )}
              <div>
                <input type="file" id="aboutStoryImg" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, "aboutUsStoryImage", "story")} />
                <label htmlFor="aboutStoryImg" className="btn-outline cursor-pointer px-4 py-2 text-xs inline-block">
                  {uploading.story ? "Uploading..." : "Upload Image"}
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Mission & Vision" desc="Your brands core mission and vision statement." />
        <div className="space-y-4">
          <div>
            <label className="text-[#555] text-xs mb-1 block">Mission Title</label>
            <input value={form.aboutUsMissionTitle || ""} onChange={e => set("aboutUsMissionTitle", e.target.value)} className="lux-input w-full" placeholder="Our Mission" />
          </div>
          <div>
            <label className="text-[#555] text-xs mb-1 block">Mission Text</label>
            <textarea value={form.aboutUsMissionText || ""} onChange={e => set("aboutUsMissionText", e.target.value)} className="lux-input w-full" rows={3} placeholder="To empower the youth..." />
          </div>
          <div>
            <label className="text-[#555] text-xs mb-1 block">Mission Image</label>
            <div className="flex gap-4 items-center">
              {form.aboutUsMissionImage ? (
                <div className="relative group rounded-xl overflow-hidden" style={{ width: 100, height: 100 }}>
                  <img src={mediaUrl(form.aboutUsMissionImage)} alt="mission" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDeleteImage("aboutUsMissionImage")} className="text-white hover:text-red-400 p-2"><FiTrash2 size={16}/></button>
                  </div>
                </div>
              ) : (
                <div className="w-[100px] h-[100px] rounded-xl border border-dashed border-[#333] flex items-center justify-center bg-[#111]">
                  <FiImage className="text-[#444]" size={24} />
                </div>
              )}
              <div>
                <input type="file" id="aboutMissionImg" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, "aboutUsMissionImage", "mission")} />
                <label htmlFor="aboutMissionImg" className="btn-outline cursor-pointer px-4 py-2 text-xs inline-block">
                  {uploading.mission ? "Uploading..." : "Upload Image"}
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

