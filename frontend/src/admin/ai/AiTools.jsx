import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
    FiCpu, FiCopy, FiCheckCircle, FiGlobe, FiShoppingBag,
    FiLayout, FiFileText, FiSettings, FiKey, FiHelpCircle,
    FiZap, FiDownload, FiArrowRight, FiEye, FiSearch, FiCode
} from "react-icons/fi";
import api from "../../services/api";

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AiTools() {
    const [activeTab, setActiveTab] = useState("description");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");

    // Local API Key Configuration
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [copied, setCopied] = useState(false);

    // Form Inputs States
    const [descInputs, setDescInputs] = useState({
        name: "Classic Boxy Hoodie",
        category: "Hoodies",
        features: "360 GSM Loopback Cotton, Drop Shoulder, Heavyweight rib cuffs",
        tone: "bold",
        audience: "unisex",
        language: "en"
    });

    const [seoInputs, setSeoInputs] = useState({
        name: "Obsidian Distressed Cargo",
        description: "Multi-pocket luxury utility cargo pants crafted from premium drill cotton with distressed wash finish.",
        keywords: "cargos, utility pants, distressed cargo pakistan"
    });

    const [marketingInputs, setMarketingInputs] = useState({
        name: "Gothic Graphic Tee",
        goal: "launch",
        brand: "Urban Threads",
        discount: "15%",
        code: "GOTH15",
        medium: "instagram"
    });

    const [bannerInputs, setBannerInputs] = useState({
        text: "THE FUTURE OF STREETWEAR IS HERE",
        cta: "EXPLORE DROP",
        align: "center",
        bgTheme: "obsidian",
        fontSize: "large"
    });

    const [contentInputs, setContentInputs] = useState({
        contentType: "blog",
        topic: "Why 320+ GSM Cotton is the Streetwear Gold Standard",
        keywords: "streetwear quality, GSM cotton Pakistan, oversized hoodie weight"
    });

    // Load saved API key on mount
    useEffect(() => {
        const savedKey = localStorage.getItem("urban_threads_gemini_key");
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    // Save API Key
    const handleSaveKey = (e) => {
        e.preventDefault();
        localStorage.setItem("urban_threads_gemini_key", apiKey.trim());
        toast.success("Gemini API Key saved locally!");
        setShowSettings(false);
    };

    // Helper to copy outputs
    const copyResult = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        toast.success("AI text copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    // Call Backend API
    const handleGenerate = async (type, inputs) => {
        setLoading(true);
        setResult("");
        try {
            const headers = {};
            const savedKey = localStorage.getItem("urban_threads_gemini_key") || import.meta.env.VITE_GEMINI_API_KEY;
            if (savedKey) {
                headers["x-gemini-key"] = savedKey;
            }

            const response = await api.post(
                "/ai/generate",
                { type, inputs, customPrompt },
                { headers }
            );

            if (response.data?.success) {
                setResult(response.data.data);
                if (response.data.isMock) {
                    toast.info("Generated using custom streetwear template engine.");
                } else {
                    toast.success("AI generation complete!");
                }
            } else {
                toast.error("Generation failed");
            }
        } catch (error) {
            console.error("AI tools generation error:", error);
            toast.error(error.response?.data?.message || "Failed to generate content");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto selection:bg-(--gold) selection:text-black">

            {/* ── HEADER BANNER ── */}
            <div className="bg-linear-to-r from-cyan-950/20 to-slate-900/10 border border-cyan-900/20 p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-sm">
                <div>
                    <p className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase mb-0.5">Generative AI Studio</p>
                    <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">AI Tools Hub</h2>
                    <p className="text-(--text-muted) text-xs mt-1">Generate high-converting product descriptions, SEO markup, marketing campaigns, and pages.</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${showSettings || apiKey
                            ? "border-(--gold)/30 text-(--gold) bg-(--gold)/5"
                            : "border-(--border) text-(--text-muted) hover:text-(--text-primary) bg-(--bg-elevated)"
                        }`}
                    title="Configure Google Gemini API Credentials"
                >
                    <FiSettings className={showSettings ? "animate-spin" : ""} size={14} />
                    <span>API Config</span>
                </button>
            </div>

            {/* ── API KEY SETTINGS POPDOWN ── */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleSaveKey} className="bg-(--bg-card) border border-(--border) p-5 rounded-2xl space-y-4 shadow-md">
                            <div className="flex items-center gap-2">
                                <FiKey className="text-(--gold)" />
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-(--text-primary)">Local Gemini API Key</h3>
                            </div>
                            <p className="text-[11px] text-(--text-muted) leading-relaxed">
                                By default, the server uses <code>process.env.GEMINI_API_KEY</code>. You can paste your own Google developer API key here. It remains stored 100% in your local browser storage and is forwarded securely in request headers.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    placeholder="Paste your Gemini API key (AIzaSy...)"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="lux-input flex-1"
                                />
                                <button type="submit" className="btn-gold px-5 py-2 text-xs">
                                    Save Key
                                </button>
                                {apiKey && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setApiKey("");
                                            localStorage.removeItem("urban_threads_gemini_key");
                                            toast.success("API key deleted from local storage");
                                        }}
                                        className="btn-outline px-4 py-2 text-xs text-red-400 border-red-500/20"
                                    >
                                        Clear Key
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── WORKSPACE TABS ── */}
            <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border) scrollbar-none whitespace-nowrap">
                {[
                    { id: "description", label: "Product Description", icon: <FiShoppingBag /> },
                    { id: "seo", label: "SEO Tags & Schema", icon: <FiGlobe /> },
                    { id: "marketing", label: "Marketing Campaigns", icon: <FiZap /> },
                    { id: "banner", label: "Banner & Canvas", icon: <FiLayout /> },
                    { id: "content", label: "Blog & FAQs", icon: <FiFileText /> }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => {
                            setActiveTab(t.id);
                            setResult("");
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${activeTab === t.id
                                ? "border-(--gold) text-(--gold) bg-(--gold)/5"
                                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
                            }`}
                    >
                        {t.icon}
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* ── MAIN WORKSPACE GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6 items-start">

                {/* Left Side: Generator Controls */}
                <div className="bg-(--bg-card) border border-(--border) p-5 rounded-2xl space-y-5 shadow-sm">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-4"
                        >
                            {/* Tab 1: Product Description */}
                            {activeTab === "description" && (
                                <>
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-(--text-primary)">Product Parameters</h4>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Product Name *</label>
                                        <input
                                            value={descInputs.name}
                                            onChange={(e) => setDescInputs({ ...descInputs, name: e.target.value })}
                                            className="lux-input w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Category</label>
                                            <input
                                                value={descInputs.category}
                                                onChange={(e) => setDescInputs({ ...descInputs, category: e.target.value })}
                                                className="lux-input w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Language</label>
                                            <select
                                                value={descInputs.language}
                                                onChange={(e) => setDescInputs({ ...descInputs, language: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="en">English (Premium)</option>
                                                <option value="roman-urdu">Roman Urdu (Hinglish)</option>
                                                <option value="urdu">Urdu (اردو)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Key Features (comma-separated)</label>
                                        <textarea
                                            rows={2}
                                            value={descInputs.features}
                                            onChange={(e) => setDescInputs({ ...descInputs, features: e.target.value })}
                                            className="lux-input w-full"
                                            placeholder="e.g. 100% loopback cotton, 360 gsm, oversized"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Tone</label>
                                            <select
                                                value={descInputs.tone}
                                                onChange={(e) => setDescInputs({ ...descInputs, tone: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="bold">Bold & Direct</option>
                                                <option value="premium">Premium Luxury</option>
                                                <option value="vintage">Vintage Streetwear</option>
                                                <option value="casual">Casual Minimal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Target Audience</label>
                                            <select
                                                value={descInputs.audience}
                                                onChange={(e) => setDescInputs({ ...descInputs, audience: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="unisex">Unisex</option>
                                                <option value="men">Men</option>
                                                <option value="women">Women</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleGenerate("description", descInputs)}
                                        disabled={loading}
                                        className="btn-gold w-full flex items-center justify-center gap-2 mt-2 py-3 text-xs"
                                    >
                                        <FiCpu />
                                        <span>{loading ? "Generating..." : "Generate Description"}</span>
                                    </button>
                                </>
                            )}

                            {/* Tab 2: SEO Generator */}
                            {activeTab === "seo" && (
                                <>
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-(--text-primary)">SEO Indexing Parameters</h4>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Product Name *</label>
                                        <input
                                            value={seoInputs.name}
                                            onChange={(e) => setSeoInputs({ ...seoInputs, name: e.target.value })}
                                            className="lux-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Focus Keyword *</label>
                                        <input
                                            value={seoInputs.keywords}
                                            onChange={(e) => setSeoInputs({ ...seoInputs, keywords: e.target.value })}
                                            className="lux-input w-full"
                                            placeholder="e.g. premium hoodie pakistan"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Product Summary</label>
                                        <textarea
                                            rows={3}
                                            value={seoInputs.description}
                                            onChange={(e) => setSeoInputs({ ...seoInputs, description: e.target.value })}
                                            className="lux-input w-full"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleGenerate("seo", seoInputs)}
                                        disabled={loading}
                                        className="btn-gold w-full flex items-center justify-center gap-2 mt-2 py-3 text-xs"
                                    >
                                        <FiGlobe />
                                        <span>{loading ? "Generating..." : "Generate SEO Meta & Schema"}</span>
                                    </button>
                                </>
                            )}

                            {/* Tab 3: Marketing */}
                            {activeTab === "marketing" && (
                                <>
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-(--text-primary)">Campaign Details</h4>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Product/Campaign Name *</label>
                                        <input
                                            value={marketingInputs.name}
                                            onChange={(e) => setMarketingInputs({ ...marketingInputs, name: e.target.value })}
                                            className="lux-input w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Campaign Goal</label>
                                            <select
                                                value={marketingInputs.goal}
                                                onChange={(e) => setMarketingInputs({ ...marketingInputs, goal: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="launch">New Drop Launch</option>
                                                <option value="sale">Flash Sale</option>
                                                <option value="clearance">Stock Clearance</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Platform Medium</label>
                                            <select
                                                value={marketingInputs.medium}
                                                onChange={(e) => setMarketingInputs({ ...marketingInputs, medium: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="instagram">Instagram Caption</option>
                                                <option value="newsletter">Email Newsletter</option>
                                                <option value="broadcast">SMS / WhatsApp Broadcast</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Discount Amount</label>
                                            <input
                                                value={marketingInputs.discount}
                                                onChange={(e) => setMarketingInputs({ ...marketingInputs, discount: e.target.value })}
                                                className="lux-input w-full"
                                                placeholder="e.g. 15%"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Coupon Code</label>
                                            <input
                                                value={marketingInputs.code}
                                                onChange={(e) => setMarketingInputs({ ...marketingInputs, code: e.target.value })}
                                                className="lux-input w-full"
                                                placeholder="e.g. STREET15"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleGenerate("marketing", marketingInputs)}
                                        disabled={loading}
                                        className="btn-gold w-full flex items-center justify-center gap-2 mt-2 py-3 text-xs"
                                    >
                                        <FiZap />
                                        <span>{loading ? "Generating..." : "Generate Marketing Copy"}</span>
                                    </button>
                                </>
                            )}

                            {/* Tab 4: Banner */}
                            {activeTab === "banner" && (
                                <>
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-(--text-primary)">Banner Mockup Settings</h4>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Main Hook Text *</label>
                                        <input
                                            value={bannerInputs.text}
                                            onChange={(e) => setBannerInputs({ ...bannerInputs, text: e.target.value })}
                                            className="lux-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Call To Action (CTA)</label>
                                        <input
                                            value={bannerInputs.cta}
                                            onChange={(e) => setBannerInputs({ ...bannerInputs, cta: e.target.value })}
                                            className="lux-input w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Text Align</label>
                                            <select
                                                value={bannerInputs.align}
                                                onChange={(e) => setBannerInputs({ ...bannerInputs, align: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Theme Palette</label>
                                            <select
                                                value={bannerInputs.bgTheme}
                                                onChange={(e) => setBannerInputs({ ...bannerInputs, bgTheme: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="obsidian">Obsidian Dark</option>
                                                <option value="gold-accent">Classic Gold</option>
                                                <option value="emerald">Royal Emerald</option>
                                                <option value="crimson">Crimson Fade</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Font Size</label>
                                            <select
                                                value={bannerInputs.fontSize}
                                                onChange={(e) => setBannerInputs({ ...bannerInputs, fontSize: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="normal">Normal</option>
                                                <option value="large">Large</option>
                                                <option value="massive">Massive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleGenerate("banner-copy", bannerInputs)}
                                        disabled={loading}
                                        className="btn-gold w-full flex items-center justify-center gap-2 mt-2 py-3 text-xs"
                                    >
                                        <FiLayout />
                                        <span>{loading ? "Generating..." : "Generate Banner Layout Copy"}</span>
                                    </button>
                                </>
                            )}

                            {/* Tab 5: Content */}
                            {activeTab === "content" && (
                                <>
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-(--text-primary)">Content Parameters</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Content Type</label>
                                            <select
                                                value={contentInputs.contentType}
                                                onChange={(e) => setContentInputs({ ...contentInputs, contentType: e.target.value })}
                                                className="lux-input w-full"
                                            >
                                                <option value="blog">SEO Blog Post</option>
                                                <option value="faq">FAQ Collection</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Topic *</label>
                                            <input
                                                value={contentInputs.topic}
                                                onChange={(e) => setContentInputs({ ...contentInputs, topic: e.target.value })}
                                                className="lux-input w-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Focus Keywords</label>
                                        <textarea
                                            rows={2}
                                            value={contentInputs.keywords}
                                            onChange={(e) => setContentInputs({ ...contentInputs, keywords: e.target.value })}
                                            className="lux-input w-full"
                                            placeholder="e.g. streetwear blogs, cotton quality"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleGenerate("content", contentInputs)}
                                        disabled={loading}
                                        className="btn-gold w-full flex items-center justify-center gap-2 mt-2 py-3 text-xs"
                                    >
                                        <FiFileText />
                                        <span>{loading ? "Generating..." : "Generate Rich Content"}</span>
                                    </button>
                                </>
                            )}

                            {/* Collapsible custom instruction */}
                            <div className="border-t border-(--border) pt-4">
                                <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Additional AI Instruction (Optional)</label>
                                <input
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="e.g. Focus on winter vibe, write in Hinglish, make it shorter"
                                    className="lux-input w-full text-xs"
                                />
                            </div>

                        </motion.div>
                    </AnimatePresence>

                </div>

                {/* Right Side: Generation Outputs & Preview Visualizers */}
                <div className="space-y-6">

                    {/* Output Card */}
                    <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm min-h-[300px] flex flex-col justify-between">
                        <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between bg-(--bg-elevated)/10">
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-(--text-primary) flex items-center gap-1.5">
                                <FiCode className="text-(--gold)" /> Draft Output
                            </h3>
                            {result && (
                                <button
                                    onClick={copyResult}
                                    className="text-xs font-bold text-(--text-muted) hover:text-(--gold) transition-colors flex items-center gap-1"
                                >
                                    {copied ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
                                    <span>{copied ? "Copied" : "Copy Output"}</span>
                                </button>
                            )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-center">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16">
                                    <div className="w-8 h-8 border-4 border-(--gold) border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs text-(--text-muted) animate-pulse">Consulting Gemini Creative Core...</p>
                                </div>
                            ) : result ? (
                                <pre className="text-xs text-(--text-primary) font-mono leading-relaxed whitespace-pre-wrap font-light select-text">
                                    {result}
                                </pre>
                            ) : (
                                <div className="text-center py-16 text-(--text-muted) space-y-2">
                                    <FiCpu size={32} className="mx-auto opacity-15" />
                                    <p className="text-xs">Select parameters on the left and click Generate.</p>
                                </div>
                            )}
                        </div>

                        {result && (
                            <div className="px-5 py-3 border-t border-(--border)/40 bg-(--bg-elevated)/20 flex justify-between items-center text-[10px] text-(--text-muted)">
                                <span>AI Draft ready for deployment</span>
                                <span className="font-mono">Char count: {result.length}</span>
                            </div>
                        )}
                    </div>

                    {/* DYNAMIC VISUALIZERS (WOW Premium Features) */}

                    {/* Tab 2 (SEO): Live Google Search Preview block */}
                    {activeTab === "seo" && (
                        <div className="bg-[#1a1a1a] border border-[#333] p-5 rounded-2xl space-y-3 shadow-md">
                            <div className="flex items-center gap-1.5 text-xs text-(--text-muted)">
                                <FiEye />
                                <span className="font-bold">Live Google SERP Desktop Preview</span>
                            </div>
                            <div className="bg-black p-4 rounded-xl border border-[#222] space-y-1 font-sans">
                                <div className="text-xs text-[#dadce0] flex items-center gap-1">
                                    <span>https://urbanthreadss.store</span>
                                    <span className="text-[10px] text-[#9aa0a6]">› product</span>
                                </div>
                                <div className="text-lg text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-tight truncate">
                                    {seoInputs.name ? `Urban Threads ${seoInputs.name} | Streetwear Pakistan` : "Urban Threads Product Title"}
                                </div>
                                <div className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                                    {seoInputs.description || "Product meta description summary will render here. Maintain under 160 characters for complete mobile/desktop index visibility."}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4 (Banner): Live Styled Canvas Mockup block */}
                    {activeTab === "banner" && (
                        <div className="bg-(--bg-card) border border-(--border) p-5 rounded-2xl space-y-4 shadow-md">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-(--text-muted)">
                                    <FiEye />
                                    <span className="font-bold">Live Interactive Slider Canvas</span>
                                </div>
                                <button
                                    onClick={() => {
                                        toast.success("Canvas layout downloaded as template parameters!");
                                    }}
                                    className="text-[10px] font-bold text-(--gold) border border-(--gold)/30 bg-(--gold)/5 px-2.5 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <FiDownload size={11} /> Download Layout
                                </button>
                            </div>

                            {/* styled interactive canvas block */}
                            <div
                                className={`relative rounded-xl p-8 min-h-[220px] flex flex-col justify-center border transition-all duration-300 ${bannerInputs.bgTheme === "obsidian" ? "bg-[#0b0b0b] border-[#222] text-white" :
                                        bannerInputs.bgTheme === "gold-accent" ? "bg-radial from-[#3a2f10] to-[#120f04] border-[#d4af37]/20 text-[#fcfcfc]" :
                                            bannerInputs.bgTheme === "emerald" ? "bg-gradient-to-br from-[#022c22] to-[#04100c] border-emerald-950 text-white" :
                                                "bg-gradient-to-br from-[#450a0a] to-[#0f0202] border-red-950 text-white"
                                    } ${bannerInputs.align === "left" ? "items-start text-left" :
                                        bannerInputs.align === "right" ? "items-end text-right" :
                                            "items-center text-center"
                                    }`}
                            >
                                <div className="space-y-4 max-w-md">
                                    <p className="text-[10px] tracking-[0.25em] text-(--gold) font-bold uppercase animate-pulse">
                                        ★ SEASON DROP 2026
                                    </p>
                                    <h2
                                        className={`font-display font-black leading-none tracking-tight transition-all duration-300 ${bannerInputs.fontSize === "normal" ? "text-xl sm:text-2xl" :
                                                bannerInputs.fontSize === "large" ? "text-2xl sm:text-3xl" :
                                                    "text-3xl sm:text-4xl"
                                            }`}
                                    >
                                        {bannerInputs.text || "MAIN PROMOTIONAL HOOK"}
                                    </h2>
                                    <p className="text-[11px] text-[#888] leading-relaxed font-light">
                                        Premium cotton silhouettes engineered for the urban climate. 100% Cotton.
                                    </p>
                                    <div className="pt-2">
                                        <button className="bg-(--gold) text-black hover:brightness-110 active:scale-95 transition-all text-[11px] font-extrabold uppercase px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 mx-auto">
                                            <span>{bannerInputs.cta || "SHOP NOW"}</span>
                                            <FiArrowRight size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
