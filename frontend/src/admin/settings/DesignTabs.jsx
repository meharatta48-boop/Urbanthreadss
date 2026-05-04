/* ══════════════════════════════════════════════════════
   DESIGN STUDIO — Color/Font/Shape controls
══════════════════════════════════════════════════════ */

const COLOR_PRESETS = {
  "Gold (Default)": { themeGold: "#c9a84c", themeGoldLight: "#e8c96a", themeGoldDark: "#8a6a1a" },
  "Emerald Green": { themeGold: "#10b981", themeGoldLight: "#34d399", themeGoldDark: "#065f46" },
  "Royal Blue": { themeGold: "#6366f1", themeGoldLight: "#818cf8", themeGoldDark: "#3730a3" },
  "Ruby Red": { themeGold: "#ef4444", themeGoldLight: "#f87171", themeGoldDark: "#991b1b" },
  "Rose Gold": { themeGold: "#d4836c", themeGoldLight: "#f0a891", themeGoldDark: "#92492e" },
  "Silver": { themeGold: "#94a3b8", themeGoldLight: "#cbd5e1", themeGoldDark: "#475569" },
};
const BG_PRESETS = {
  "Deep Black": { themeBgDeep: "#050505", themeBgSurface: "#0c0c0c", themeBgCard: "#111111", themeBgElevated: "#1a1a1a" },
  "Dark Navy": { themeBgDeep: "#030712", themeBgSurface: "#0f172a", themeBgCard: "#1e293b", themeBgElevated: "#334155" },
  "Dark Brown": { themeBgDeep: "#0c0a08", themeBgSurface: "#1c1410", themeBgCard: "#2a1f17", themeBgElevated: "#3d2f24" },
  "Dark Purple": { themeBgDeep: "#09080f", themeBgSurface: "#130f1e", themeBgCard: "#1e1630", themeBgElevated: "#2d2247" },
};
const FONT_OPTIONS = ["Inter", "Roboto", "Poppins", "Outfit", "Lato", "Open Sans", "Montserrat", "Nunito", "Raleway", "DM Sans"];
const DISPLAY_FONTS = ["Playfair Display", "Cormorant Garamond", "EB Garamond", "Libre Baskerville", "Merriweather", "Lora", "Cinzel"];

function ColorRow({ label, field, form, set, hint }) {
  return (
    <div className="flex items-center gap-3 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-3">
      <input type="color" value={form[field] || "#000000"}
        onChange={(e) => set(field, e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer flex-shrink-0" style={{ padding: 0, border: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {hint && <p className="text-[#444] text-xs">{hint}</p>}
      </div>
      <code className="text-[#c9a84c] text-xs font-mono">{form[field]}</code>
    </div>
  );
}

export function DesignStudioTab({ form, set }) {
  const applyPreset = (p) => Object.entries(p).forEach(([k, v]) => set(k, v));
  return (
    <div className="space-y-6">
      {/* ACCENT */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div><p className="text-white font-semibold mb-0.5">🎨 Accent Color</p><p className="text-[#444] text-xs">Brand color — buttons, links, highlights sab pe lagta hai</p></div>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(COLOR_PRESETS).map(([n, p]) => (
            <button key={n} onClick={() => applyPreset(p)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border border-[#1a1a1a] text-[#9a9a9a] hover:border-[#333] hover:text-white transition-all">
              <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.themeGold }} />{n}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ColorRow label="Primary" field="themeGold" form={form} set={set} hint="Main color" />
          <ColorRow label="Light" field="themeGoldLight" form={form} set={set} hint="Hover" />
          <ColorRow label="Dark" field="themeGoldDark" form={form} set={set} hint="Pressed" />
        </div>
      </div>

      {/* BACKGROUND */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div><p className="text-white font-semibold mb-0.5">🌑 Backgrounds</p><p className="text-[#444] text-xs">Page, sections, cards ka background</p></div>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(BG_PRESETS).map(([n, p]) => (
            <button key={n} onClick={() => applyPreset(p)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border border-[#1a1a1a] text-[#9a9a9a] hover:border-[#333] hover:text-white transition-all">
              <span className="w-3.5 h-3.5 rounded-full border border-[#444]" style={{ background: p.themeBgDeep }} />{n}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ColorRow label="Page BG" field="themeBgDeep" form={form} set={set} hint="Outer page" />
          <ColorRow label="Surface" field="themeBgSurface" form={form} set={set} hint="Sections" />
          <ColorRow label="Card" field="themeBgCard" form={form} set={set} hint="Cards" />
          <ColorRow label="Elevated" field="themeBgElevated" form={form} set={set} hint="Inputs" />
        </div>
      </div>

      {/* TEXT & BORDERS */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div><p className="text-white font-semibold">📝 Text & Borders</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ColorRow label="Border" field="themeBorder" form={form} set={set} />
          <ColorRow label="Border Light" field="themeBorderLight" form={form} set={set} />
          <ColorRow label="Text Primary" field="themeTextPrimary" form={form} set={set} hint="Headings" />
          <ColorRow label="Text Secondary" field="themeTextSecondary" form={form} set={set} hint="Subtitles" />
          <ColorRow label="Text Muted" field="themeTextMuted" form={form} set={set} hint="Labels" />
        </div>
      </div>

      {/* TYPOGRAPHY */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div><p className="text-white font-semibold">🔤 Typography</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Heading Font</label>
            <select value={form.themeFontDisplay || "Playfair Display"} onChange={(e) => set("themeFontDisplay", e.target.value)} className="lux-select w-full">
              {DISPLAY_FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <p className="mt-3 text-2xl" style={{ fontFamily: `'${form.themeFontDisplay || "Playfair Display"}', serif`, color: form.themeGold || "#c9a84c" }}>
              Urban Thread
            </p>
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Body Font</label>
            <select value={form.themeFontBody || "Inter"} onChange={(e) => set("themeFontBody", e.target.value)} className="lux-select w-full">
              {FONT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <p className="mt-3 text-sm text-[#9a9a9a]" style={{ fontFamily: `'${form.themeFontBody || "Inter"}', sans-serif` }}>
              Premium streetwear from Pakistan
            </p>
          </div>
        </div>
      </div>

      {/* SHAPE */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div><p className="text-white font-semibold">📐 Shape & Shadow</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-3">
              Border Radius — <span style={{ color: form.themeGold || "#c9a84c" }}>{form.themeRadius || 12}px</span>
            </label>
            <input type="range" min="0" max="24" value={form.themeRadius || 12}
              onChange={(e) => set("themeRadius", e.target.value)} className="w-full" style={{ accentColor: form.themeGold || "#c9a84c" }} />
            <div className="flex gap-2 mt-3">
              {[0, 6, 12, 18, 24].map((r) => (
                <button key={r} onClick={() => set("themeRadius", String(r))}
                  className="flex-1 h-9 text-xs text-[#555] border border-[#1a1a1a] hover:text-white transition-all bg-[#111]"
                  style={{ borderRadius: `${r}px` }}>{r}px</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-3">Shadow</label>
            {["luxury", "minimal", "none"].map((s) => (
              <label key={s} className="flex items-center gap-3 p-3 mb-2 rounded-xl border border-[#1a1a1a] cursor-pointer hover:border-[#333] transition-all">
                <input type="radio" name="shadow" value={s} checked={(form.themeShadow || "luxury") === s} onChange={() => set("themeShadow", s)} style={{ accentColor: form.themeGold || "#c9a84c" }} />
                <div>
                  <p className="text-white text-sm capitalize">{s}</p>
                  <p className="text-[#444] text-xs">{s === "luxury" ? "Deep shadows" : s === "minimal" ? "Subtle" : "No shadows"}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ SECTIONS & TEXT ═══ */
function Toggle({ label, field, form, set, desc }) {
  const val = form[field] !== false;
  return (
    <div className="flex items-center justify-between p-4 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl">
      <div>
        <p className="text-white text-sm font-semibold">{label}</p>
        {desc && <p className="text-[#444] text-xs mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => set(field, !val)}
        className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
        style={{ background: val ? (form.themeGold || "#c9a84c") : "#1a1a1a" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
          style={{ left: val ? "calc(100% - 22px)" : 2, background: val ? "#000" : "#555" }} />
      </button>
    </div>
  );
}

function SField({ label, field, form, set, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">{label}</label>
      <input value={form[field] || ""} onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder} className="lux-input" />
    </div>
  );
}

export function SectionsTab({ form, set }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6">
        <p className="text-white font-semibold mb-4">👁️ Section Visibility</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Toggle label="Hero Slider" field="showHero" form={form} set={set} desc="Full-screen hero slideshow" />
          <Toggle label="Stats" field="showStats" form={form} set={set} desc="Numbers & trust strip" />
          <Toggle label="Featured Products" field="showFeatured" form={form} set={set} desc="6 curated products" />
          <Toggle label="Brand Story" field="showBrandStory" form={form} set={set} desc="About section" />
          <Toggle label="Reviews" field="showReviews" form={form} set={set} desc="Customer testimonials" />
          <Toggle label="Newsletter" field="showNewsletter" form={form} set={set} desc="Email subscribe" />
        </div>
      </div>
      {[
        { title: "📊 Stats Section", fields: [["Sub Label", "statsSubLabel", "By The Numbers"], ["Main Title", "statsTitle", "Pakistan Ke Bharose Ka Nishaana"]] },
        { title: "🛍️ Featured Products", fields: [["Label", "featuredLabel", "Curated Picks"], ["Title", "featuredTitle", "Featured Collection"]] },
        { title: "⭐ Reviews", fields: [["Label", "reviewsLabel", "Real Reviews"], ["Title", "reviewsTitle", "What Our Customers Say"]] },
        { title: "📧 Newsletter", fields: [["Label", "newsletterLabel", "Newsletter"], ["Title", "newsletterTitle", "Get Exclusive Deals First"], ["Description", "newsletterDesc", "Subscribe karo..."]] },
        { title: "💬 Support Page", fields: [["Title", "supportTitle", "Hum Yahan Hain"], ["Subtitle", "supportSubtitle", "24/7 available"], ["Hours", "supportHours", "Mon–Sat: 9am – 9pm"]] },
      ].map(({ title, fields }) => (
        <div key={title} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6">
          <p className="text-white font-semibold mb-4">{title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(([label, field, placeholder]) => (
              <SField key={field} label={label} field={field} form={form} set={set} placeholder={placeholder} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══ ANNOUNCEMENT ═══ */
export function AnnouncementTab({ form, set }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-white font-semibold">📢 Announcement Bar</p>
          <p className="text-[#444] text-xs mt-0.5">Coupon bar ki jagah custom message. Khali chodo to coupon code dikhega.</p>
        </div>
        <div>
          <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Text</label>
          <textarea value={form.announcementText || ""} onChange={(e) => set("announcementText", e.target.value)}
            rows={2} placeholder="🎉 Free delivery on orders above Rs. 2000!" className="lux-input" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Background Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.announcementBg || "#c9a84c"} onChange={(e) => set("announcementBg", e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer" style={{ padding: 0, border: 0 }} />
              <code className="text-[#c9a84c] text-sm font-mono">{form.announcementBg || "#c9a84c"}</code>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-2">Text Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.announcementColor || "#000000"} onChange={(e) => set("announcementColor", e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer" style={{ padding: 0, border: 0 }} />
              <code className="text-[#c9a84c] text-sm font-mono">{form.announcementColor || "#000000"}</code>
            </div>
          </div>
        </div>
        {form.announcementText && (
          <div>
            <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Preview</p>
            <div className="py-2.5 px-4 rounded-xl text-center text-sm font-semibold"
              style={{ background: form.announcementBg || "#c9a84c", color: form.announcementColor || "#000" }}>
              {form.announcementText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ CUSTOM CSS ═══ */
const SNIPPETS = [
  { label: "Bigger font", css: "body { font-size: 17px; }" },
  { label: "Round buttons", css: ".btn-gold { border-radius: 999px !important; }" },
  { label: "Wider layout", css: ".max-w-7xl { max-width: 1400px !important; }" },
  { label: "Hide scrollbar", css: "::-webkit-scrollbar { display: none; }" },
];

const CSS_VARS = [
  ["--gold", "Primary accent"], ["--gold-light", "Accent light"], ["--gold-dark", "Accent dark"],
  ["--bg-deep", "Page bg"], ["--bg-surface", "Section bg"], ["--bg-card", "Card bg"],
  ["--bg-elevated", "Input bg"], ["--border", "Border"], ["--text-primary", "Main text"],
  ["--text-secondary", "Subtitle"], ["--text-muted", "Labels"], ["--radius", "Border radius"],
];

export function CustomCSSTab({ form, set }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-white font-semibold">💻 Custom CSS</p>
          <p className="text-[#444] text-xs mt-0.5">Yahan likha CSS poori website par apply hoga</p>
        </div>
        <div className="bg-yellow-900/10 border border-yellow-700/20 rounded-xl p-3">
          <p className="text-yellow-400 text-xs">⚠️ Advanced feature — galat CSS se website ka design bigad sakta hai.</p>
        </div>
        <div>
          <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Quick Snippets</p>
          <div className="flex flex-wrap gap-2">
            {SNIPPETS.map((s) => (
              <button key={s.label} onClick={() => set("customCSS", (form.customCSS || "") + "\n" + s.css)}
                className="text-xs px-3 py-1.5 rounded-xl border border-[#1a1a1a] text-[#555] hover:text-[#c9a84c] hover:border-[#c9a84c]/20 transition-all">
                + {s.label}
              </button>
            ))}
          </div>
        </div>
        <textarea value={form.customCSS || ""} onChange={(e) => set("customCSS", e.target.value)}
          rows={16} spellCheck={false}
          placeholder={"/* Custom CSS likhein */\n\n.btn-gold {\n  border-radius: 999px !important;\n}"}
          className="w-full text-sm font-mono rounded-2xl"
          style={{ background: "#050505", border: "1px solid #1a1a1a", padding: 16, outline: "none", resize: "vertical", color: "#c9a84c", lineHeight: 1.7, minHeight: 200 }}
        />
        <div className="flex justify-between">
          <span className="text-[#333] text-xs">{(form.customCSS || "").length} chars</span>
          <button onClick={() => set("customCSS", "")} className="text-xs text-red-400/40 hover:text-red-400 transition-colors">Clear</button>
        </div>
      </div>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6">
        <p className="text-white font-semibold mb-4">🎨 CSS Variables</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CSS_VARS.map(([v, d]) => (
            <div key={v} className="flex items-center gap-2 bg-[#050505] rounded-xl px-3 py-2 border border-[#111]">
              <code className="text-[#c9a84c] text-xs font-mono">{v}</code>
              <span className="text-[#333] text-xs ml-auto">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TYPOGRAPHY SIZES TAB
══════════════════════════════════════════════════════ */
function SizeSlider({ label, field, form, set, min, max, step = 1, unit = "px", hint }) {
  const val = Number(form[field]) || Number(min) + Math.floor((Number(max) - Number(min)) / 2);
  return (
    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          {hint && <p className="text-[#444] text-xs">{hint}</p>}
        </div>
        <span className="text-[#c9a84c] font-mono text-sm font-bold">{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => set(field, e.target.value)}
        className="w-full" style={{ accentColor: "#c9a84c" }} />
      <div className="flex justify-between text-[#333] text-xs mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export function TypographySizesTab({ form, set }) {
  const accent = form.themeGold || "#c9a84c";
  const displayFont = form.themeFontDisplay || "Playfair Display";
  const bodyFont = form.themeFontBody || "Inter";

  return (
    <div className="space-y-6">
      {/* FONT SIZES           j  iih'h9hhjih9gh4ig   */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-white font-semibold">📏 Font Sizes</p>
          <p className="text-[#444] text-xs mt-0.5">Har jagah ka text size control karo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SizeSlider label="Body Text" field="fontSizeBase" form={form} set={set} min={12} max={22} hint="Paragraph, description" />
          <SizeSlider label="Hero Heading" field="fontSizeH1" form={form} set={set} min={28} max={80} hint="Hero section title" />
          <SizeSlider label="Section Heading" field="fontSizeH2" form={form} set={set} min={22} max={64} hint="Section titles" />
          <SizeSlider label="Card Title" field="fontSizeH3" form={form} set={set} min={14} max={32} hint="Product names, card heads" />
          <SizeSlider label="Labels / Tags" field="fontSizeSmall" form={form} set={set} min={9} max={16} hint="Section labels, tags" />
        </div>
      </div>

      {/* LINE HEIGHT & SPACING */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <p className="text-white font-semibold">↕️ Spacing</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SizeSlider label="Line Height" field="lineHeight" form={form} set={set} min={1.2} max={2.2} step={0.05} unit="×" hint="Text line spacing" />
          <SizeSlider label="Letter Spacing" field="letterSpacing" form={form} set={set} min={-0.05} max={0.2} step={0.01} unit="em" hint="Space between letters" />
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6">
        <p className="text-white font-semibold mb-4">👁️ Live Preview</p>
        <div className="space-y-3 p-4 bg-[#050505] rounded-xl border border-[#111]">
          <p style={{ fontSize: `${form.fontSizeSmall || 13}px`, color: accent, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Section Label
          </p>
          <h1 style={{ fontFamily: `'${displayFont}',serif`, fontSize: `clamp(${(form.fontSizeH1 || 48) * 0.55}px, 7vw, ${form.fontSizeH1 || 48}px)`, color: "#fff", lineHeight: 1.05 }}>
            Style That <span style={{ background: `linear-gradient(135deg,${form.themeGoldLight || "#e8c96a"},${accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Speaks</span>
          </h1>
          <h2 style={{ fontFamily: `'${displayFont}',serif`, fontSize: `${form.fontSizeH2 || 36}px`, color: "#fff", lineHeight: 1.1 }}>
            Featured <span style={{ color: accent }}>Collection</span>
          </h2>
          <h3 style={{ fontSize: `${form.fontSizeH3 || 22}px`, color: "#fff" }}>Product Name Goes Here</h3>
          <p style={{ fontSize: `${form.fontSizeBase || 16}px`, color: form.themeTextSecondary || "#9a9a9a", fontFamily: `'${bodyFont}',sans-serif`, lineHeight: form.lineHeight || 1.65, letterSpacing: `${form.letterSpacing || 0}em` }}>
            Premium Pakistani streetwear — crafted for the bold and the fearless. Har season ka naya drop, sirf Urban Thread pe.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   IMAGE SIZES TAB
══════════════════════════════════════════════════════ */
const RATIO_OPTIONS = [
  { label: "3:4 (Portrait)", value: "3/4", preview: "w-12 h-16" },
  { label: "1:1 (Square)", value: "1/1", preview: "w-14 h-14" },
  { label: "4:5", value: "4/5", preview: "w-12 h-[60px]" },
  { label: "4:3 (Landscape)", value: "4/3", preview: "w-16 h-12" },
  { label: "16:9 (Wide)", value: "16/9", preview: "w-20 h-[45px]" },
  { label: "2:3", value: "2/3", preview: "w-10 h-[60px]" },
];
const HERO_HEIGHTS = ["60vh", "70vh", "80vh", "90vh", "100vh", "100svh", "100dvh"];
const FIT_OPTIONS = [
  { value: "cover", desc: "Image fills — may crop edges (recommended)" },
  { value: "contain", desc: "Full image visible — may have empty space" },
];

export function ImageSizesTab({ form, set }) {
  const accent = form.themeGold || "#c9a84c";
  return (
    <div className="space-y-6">
      {/* PRODUCT CARD RATIO */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-white font-semibold">🖼️ Product Card Image Ratio</p>
          <p className="text-[#444] text-xs mt-0.5">Shop page aur home page product cards ka image shape</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RATIO_OPTIONS.map(({ label, value, preview }) => {
            const selected = (form.productCardRatio || "3/4") === value;
            return (
              <button key={value} onClick={() => set("productCardRatio", value)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                style={{ borderColor: selected ? accent : "#1a1a1a", background: selected ? `${accent}10` : "#0c0c0c" }}>
                <div className={`${preview} rounded-lg`} style={{ background: selected ? `${accent}30` : "#1a1a1a", border: `2px solid ${selected ? accent : "#333"}` }} />
                <span className="text-xs" style={{ color: selected ? accent : "#555" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BRAND STORY RATIO */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-white font-semibold">📸 Brand Story Image Ratio</p>
          <p className="text-[#444] text-xs mt-0.5">About / Brand Story section ki image shape</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RATIO_OPTIONS.map(({ label, value, preview }) => {
            const selected = (form.brandImageRatio || "4/5") === value;
            return (
              <button key={value} onClick={() => set("brandImageRatio", value)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                style={{ borderColor: selected ? accent : "#1a1a1a", background: selected ? `${accent}10` : "#0c0c0c" }}>
                <div className={`${preview} rounded-lg`} style={{ background: selected ? `${accent}30` : "#1a1a1a", border: `2px solid ${selected ? accent : "#333"}` }} />
                <span className="text-xs" style={{ color: selected ? accent : "#555" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* IMAGE FIT */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <p className="text-white font-semibold">⚙️ Image Fit Mode</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIT_OPTIONS.map(({ value, desc }) => {
            const selected = (form.productImgFit || "cover") === value;
            return (
              <label key={value} className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all"
                style={{ borderColor: selected ? accent : "#1a1a1a", background: selected ? `${accent}08` : "#0c0c0c" }}>
                <input type="radio" name="imgFit" value={value} checked={selected} onChange={() => set("productImgFit", value)} style={{ accentColor: accent, marginTop: 2 }} />
                <div>
                  <p className="text-white text-sm font-semibold capitalize">{value}</p>
                  <p className="text-[#444] text-xs mt-0.5">{desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* HERO HEIGHT */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-white font-semibold">📐 Hero Section Height</p>
          <p className="text-[#444] text-xs mt-0.5">Home page ka hero slider kitna tall ho</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HERO_HEIGHTS.map((h) => {
            const selected = (form.heroHeight || "100svh") === h;
            return (
              <button key={h} onClick={() => set("heroHeight", h)}
                className="px-4 py-2 rounded-xl border text-sm font-mono transition-all"
                style={{ borderColor: selected ? accent : "#1a1a1a", color: selected ? accent : "#555", background: selected ? `${accent}10` : "#0c0c0c" }}>
                {h}
              </button>
            );
          })}
        </div>
        <p className="text-[#333] text-xs">svh/dvh = safe viewport (mobile friendly). vh = full browser height.</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ICONS TAB
══════════════════════════════════════════════════════ */
import {
  FiShoppingBag, FiHeart, FiUser, FiSearch, FiMenu, FiPackage,
  FiTruck, FiCheckCircle, FiStar, FiPhone, FiMail, FiMapPin,
  FiInstagram, FiFacebook, FiYoutube, FiTwitter, FiArrowRight,
  FiShoppingCart, FiHome, FiGrid, FiTag, FiGift, FiBell,
} from "react-icons/fi";

const ICON_SIZES = [14, 16, 18, 20, 22, 24, 28, 32];

const DEMO_ICONS = [
  { name: "Shopping Bag", icon: <FiShoppingBag /> },
  { name: "Cart", icon: <FiShoppingCart /> },
  { name: "Heart / Fav", icon: <FiHeart /> },
  { name: "User", icon: <FiUser /> },
  { name: "Search", icon: <FiSearch /> },
  { name: "Menu", icon: <FiMenu /> },
  { name: "Package", icon: <FiPackage /> },
  { name: "Truck", icon: <FiTruck /> },
  { name: "Check Circle", icon: <FiCheckCircle /> },
  { name: "Star", icon: <FiStar /> },
  { name: "Phone", icon: <FiPhone /> },
  { name: "Mail", icon: <FiMail /> },
  { name: "Location", icon: <FiMapPin /> },
  { name: "Instagram", icon: <FiInstagram /> },
  { name: "Facebook", icon: <FiFacebook /> },
  { name: "YouTube", icon: <FiYoutube /> },
  { name: "Arrow Right", icon: <FiArrowRight /> },
  { name: "Home", icon: <FiHome /> },
  { name: "Grid", icon: <FiGrid /> },
  { name: "Tag / Coupon", icon: <FiTag /> },
  { name: "Gift", icon: <FiGift /> },
  { name: "Bell", icon: <FiBell /> },
];

function IconToggle({ label, field, form, set, desc }) {
  const val = form[field] !== false;
  const accent = form.themeGold || "#c9a84c";
  return (
    <div className="flex items-center justify-between p-3 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl">
      <div>
        <p className="text-white text-sm">{label}</p>
        {desc && <p className="text-[#444] text-xs">{desc}</p>}
      </div>
      <button onClick={() => set(field, !val)}
        className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
        style={{ background: val ? accent : "#1a1a1a" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
          style={{ left: val ? "calc(100% - 22px)" : 2, background: val ? "#000" : "#555" }} />
      </button>
    </div>
  );
}

export function IconsTab({ form, set }) {
  const accent = form.themeGold || "#c9a84c";
  return (
    <div className="space-y-6">
      {/* ICON SIZE CONTROLS */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-5">
        <div>
          <p className="text-white font-semibold">📐 Icon Sizes</p>
          <p className="text-[#444] text-xs mt-0.5">Website ke different areas mein icons ka size</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* NAV ICON SIZE */}
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-3">
              Navbar Icons — <span style={{ color: accent }}>{form.navIconSize || 20}px</span>
            </label>
            <input type="range" min={14} max={28} value={form.navIconSize || 20}
              onChange={(e) => set("navIconSize", e.target.value)}
              className="w-full" style={{ accentColor: accent }} />
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              {[FiShoppingBag, FiUser, FiSearch, FiHeart, FiMenu].map((Icon, i) => (
                <span key={i} className="p-2 bg-[#111] rounded-xl border border-[#1a1a1a]" style={{ color: accent }}>
                  <Icon size={Number(form.navIconSize) || 20} />
                </span>
              ))}
            </div>
          </div>
          {/* SOCIAL ICON SIZE */}
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-3">
              Social Icons — <span style={{ color: accent }}>{form.socialIconSize || 20}px</span>
            </label>
            <input type="range" min={14} max={32} value={form.socialIconSize || 20}
              onChange={(e) => set("socialIconSize", e.target.value)}
              className="w-full" style={{ accentColor: accent }} />
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              {[FiInstagram, FiFacebook, FiYoutube, FiTwitter].map((Icon, i) => (
                <span key={i} className="p-2 bg-[#111] rounded-xl border border-[#1a1a1a]" style={{ color: accent }}>
                  <Icon size={Number(form.socialIconSize) || 20} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ICON VISIBILITY */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 space-y-3">
        <p className="text-white font-semibold mb-1">👁️ Show / Hide Icon Groups</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <IconToggle label="Navbar Icons" field="navIcons" form={form} set={set} desc="Cart, user, search icons" />
          <IconToggle label="Footer Icons" field="footerIcons" form={form} set={set} desc="Social media icons" />
          <IconToggle label="Product Icons" field="productIcons" form={form} set={set} desc="Add to cart, arrows" />
        </div>
      </div>

      {/* ICON PREVIEW GRID */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6">
        <p className="text-white font-semibold mb-4">🗂️ Icon Library Preview</p>
        <p className="text-[#333] text-xs mb-4">Yeh sab icons website mein use ho rahe hain (react-icons/fi)</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {DEMO_ICONS.map(({ name, icon }) => (
            <div key={name} className="flex flex-col items-center gap-1.5 p-3 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl hover:border-[#333] transition-all">
              <span style={{ color: accent, fontSize: 22 }}>{icon}</span>
              <span className="text-[9px] text-[#444] text-center leading-tight">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ICON STYLE INFO */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6">
        <p className="text-white font-semibold mb-2">ℹ️ Icon Style</p>
        <p className="text-[#555] text-sm">
          Website mein <code className="text-[#c9a84c] font-mono">react-icons/fi</code> (Feather Icons) use ho rahe hain — clean, outline style.
          Agar alag style chahiye to Custom CSS tab se override kar sakte hain.
        </p>
        <div className="mt-3 p-3 bg-[#050505] rounded-xl border border-[#111]">
          <code className="text-[#c9a84c] text-xs font-mono">
            {"/* Example — make all icons bold */\n.fi { stroke-width: 2.5; }"}
          </code>
        </div>
      </div>
    </div>
  );
}
