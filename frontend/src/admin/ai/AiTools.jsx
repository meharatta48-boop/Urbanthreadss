import { useState } from "react";
import { motion } from "framer-motion";
import { FiCpu, FiFileText, FiSearch, FiZap, FiEdit, FiLayers, FiCopy } from "react-icons/fi";
import { toast } from "react-toastify";

export default function AiTools() {
  const [activeTab, setActiveTab] = useState("description");
  
  // AI Description Generator State
  const [descInput, setDescInput] = useState({
    name: "Urban Oversized Hoodie",
    category: "Hoodies",
    fit: "Oversized Fit",
    fabric: "100% Terry Cotton",
    vibe: "Streetwear, Pakistani Youth culture"
  });
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [generating, setGenerating] = useState(false);

  // AI Product Generator State
  const [prodInput, setProdInput] = useState({
    theme: "Vintage Pakistani Pop Culture",
    category: "T-Shirts"
  });
  const [generatedProduct, setGeneratedProduct] = useState(null);

  // AI SEO Generator State
  const [seoInput, setSeoInput] = useState({
    title: "Urban Threads Premium Streetwear Hoodie",
    keywords: "streetwear, hoodie, pakistan streetwear, cotton hoodies"
  });
  const [generatedSeo, setGeneratedSeo] = useState(null);

  const generateDescription = () => {
    setGenerating(true);
    setTimeout(() => {
      const copy = `Experience ultimate street-cred with the **${descInput.name}**. Engineered with a premium **${descInput.fabric}**, this **${descInput.category}** delivers the perfect balance of breathability and structure. Designed with a signature **${descInput.fit}** that captures the raw, unfiltered energy of Lahore and Karachi. Featuring thick ribbed cuffs and a double-lined hood, it’s a wardrobe statement crafted for the bold. wear the vibe. Define the streets.`;
      setGeneratedDesc(copy);
      setGenerating(false);
      toast.success("AI Description generated successfully!");
    }, 1200);
  };

  const generateProductTemplate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedProduct({
        name: `Manto Retro Streetwear Tee - ${prodInput.theme}`,
        price: 2450,
        comparePrice: 3200,
        description: `Pay homage to classic graphics with the ${prodInput.theme} Tee. Oversized drop-shoulder block, vintage enzyme washed fabric for a distressed aesthetic. Features high-density screen print detail. Crafted for style statement.`,
        tags: ["vintage", "graphic-tee", "cotton", "streetwear-pakistan"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Charcoal Grey", "Off White"]
      });
      setGenerating(false);
      toast.success("AI Product template drafted!");
    }, 1500);
  };

  const generateSeoTags = () => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedSeo({
        title: `${seoInput.title} | Premium Pakistani Streetwear`,
        description: `Buy ${seoInput.title} online at Urban Threads. Premium streetwear crafted in Pakistan, made from 100% combed cotton. Cash on Delivery nationwide. Shop now!`,
        keywords: `${seoInput.keywords}, urban threads, pakistani clothing brand, best streetwear lahore, cod fashion`,
        schemaMarkup: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "${seoInput.title}",
  "brand": {
    "@type": "Brand",
    "name": "Urban Threads"
  }
}`
      });
      setGenerating(false);
      toast.success("SEO tags generated!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-linear-to-r from-cyan-950/20 to-slate-900/10 border border-cyan-900/20 p-6 rounded-2xl">
        <p className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase mb-0.5">Copilot AI Room</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">AI Writing & Generation Tools</h2>
        <p className="text-(--text-muted) text-xs mt-1">Leverage LLM logic to write descriptions, SEO headers, or draft product catalogs instantaneously.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border)">
        {[
          { id: "description", label: "AI Description", icon: <FiFileText /> },
          { id: "product", label: "AI Product Generator", icon: <FiZap /> },
          { id: "seo", label: "AI SEO tags", icon: <FiSearch /> }
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

      <div className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl">
        {/* TAB 1: Description */}
        {activeTab === "description" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Product Specs</h4>
              <div>
                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Product Title</label>
                <input value={descInput.name} onChange={e => setDescInput({...descInput, name: e.target.value})} className="lux-input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Category</label>
                  <input value={descInput.category} onChange={e => setDescInput({...descInput, category: e.target.value})} className="lux-input w-full" />
                </div>
                <div>
                  <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Fit</label>
                  <input value={descInput.fit} onChange={e => setDescInput({...descInput, fit: e.target.value})} className="lux-input w-full" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Fabric Weight / Detail</label>
                <input value={descInput.fabric} onChange={e => setDescInput({...descInput, fabric: e.target.value})} className="lux-input w-full" />
              </div>
              <div>
                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Marketing / Vibe Keyword</label>
                <input value={descInput.vibe} onChange={e => setDescInput({...descInput, vibe: e.target.value})} className="lux-input w-full" />
              </div>
              <button onClick={generateDescription} disabled={generating} className="btn-gold w-full flex items-center justify-center gap-2">
                <FiCpu /> {generating ? "Generating..." : "Draft Description"}
              </button>
            </div>

            {/* Generated Result */}
            <div className="space-y-3 p-5 rounded-xl bg-(--bg-elevated) border border-(--border)">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--gold)">Generated Copy</h4>
              {generatedDesc ? (
                <div className="space-y-3">
                  <p className="text-xs text-(--text-primary) leading-relaxed font-light whitespace-pre-wrap">{generatedDesc}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDesc);
                      toast.success("Copied to clipboard!");
                    }}
                    className="btn-outline text-[11px] py-1.5 px-3 flex items-center gap-1"
                  >
                    <FiCopy /> Copy to Clipboard
                  </button>
                </div>
              ) : (
                <p className="text-xs text-(--text-muted) leading-loose py-12 text-center">Fill specs and click generate to run the LLM compiler.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI Product Generator */}
        {activeTab === "product" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Design Theme</h4>
              <div>
                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Drop theme / Concept Inspiration</label>
                <input value={prodInput.theme} onChange={e => setProdInput({...prodInput, theme: e.target.value})} className="lux-input w-full" placeholder="e.g. Neon Streets Raw Karachi" />
              </div>
              <div>
                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Category</label>
                <select value={prodInput.category} onChange={e => setProdInput({...prodInput, category: e.target.value})} className="lux-input w-full">
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="Sweatshirts">Sweatshirts</option>
                  <option value="Cargo Pants">Cargo Pants</option>
                </select>
              </div>
              <button onClick={generateProductTemplate} disabled={generating} className="btn-gold w-full flex items-center justify-center gap-2">
                <FiZap /> {generating ? "Generating Template..." : "Draft Full Product"}
              </button>
            </div>

            {/* Generated template */}
            <div className="p-5 rounded-xl bg-(--bg-elevated) border border-(--border) space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-(--gold)">AI Drafted Product Schema</h4>
              {generatedProduct ? (
                <div className="space-y-2">
                  <p className="text-(--text-primary) font-bold">{generatedProduct.name}</p>
                  <p className="text-(--gold) font-bold font-mono">Price: Rs. {generatedProduct.price} · Compare: Rs. {generatedProduct.comparePrice}</p>
                  <p className="text-(--text-muted) leading-relaxed mt-2 text-[11px]">{generatedProduct.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {generatedProduct.tags.map((t, idx) => <span key={idx} className="bg-(--bg-card) border border-(--border) px-2 py-0.5 rounded text-[10px] text-(--text-muted)">{t}</span>)}
                  </div>
                  <p className="text-[10px] text-(--text-muted) mt-2">Sizes: {generatedProduct.sizes.join(", ")} | Colors: {generatedProduct.colors.join(", ")}</p>
                </div>
              ) : (
                <p className="text-xs text-(--text-muted) text-center py-12">Click generate to construct a standard catalog product template.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AI SEO */}
        {activeTab === "seo" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Product parameters</h4>
              <div>
                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Target Keyword Focus</label>
                <input value={seoInput.title} onChange={e => setSeoInput({...seoInput, title: e.target.value})} className="lux-input w-full" />
              </div>
              <div>
                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Keywords</label>
                <input value={seoInput.keywords} onChange={e => setSeoInput({...seoInput, keywords: e.target.value})} className="lux-input w-full" />
              </div>
              <button onClick={generateSeoTags} disabled={generating} className="btn-gold w-full flex items-center justify-center gap-2">
                <FiSearch /> {generating ? "Optimizing SEO..." : "Generate Schema & Meta"}
              </button>
            </div>

            {/* Generated SEO */}
            <div className="p-5 rounded-xl bg-(--bg-elevated) border border-(--border) space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-(--gold)">SEO Tags</h4>
              {generatedSeo ? (
                <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                  <div>
                    <span className="text-(--text-muted) text-[10px] uppercase font-bold block">Meta Title</span>
                    <p className="text-(--text-primary) font-sans font-semibold text-xs mt-0.5">{generatedSeo.title}</p>
                  </div>
                  <div>
                    <span className="text-(--text-muted) text-[10px] uppercase font-bold block">Meta Description</span>
                    <p className="text-(--text-primary) font-sans font-light mt-0.5">{generatedSeo.description}</p>
                  </div>
                  <div>
                    <span className="text-(--text-muted) text-[10px] uppercase font-bold block">Structured JSON-LD Schema</span>
                    <pre className="p-2 rounded bg-(--bg-card) border border-(--border) text-[10px] text-[#60a5fa] overflow-x-auto mt-0.5">{generatedSeo.schemaMarkup}</pre>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-(--text-muted) text-center py-12">Click generate to calculate SEO titles and micro-data schematics.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
