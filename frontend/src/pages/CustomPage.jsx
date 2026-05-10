import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";

export default function CustomPage() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [page, setPage]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/pages/${slug}`);
        if (data.success) setPage(data.page);
        else setError("Page nahi mila");
      } catch (e) {
        setError(e.response?.status === 404 ? "Page nahi mila" : "Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-deep)" }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--gold) transparent var(--gold) transparent" }} />
    </div>
  );

  if (error || !page) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-deep)" }}>
      <p className="text-6xl mb-4">404</p>
      <p className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Page Nahi Mila</p>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Yeh page ya to exist nahi karta ya private hai</p>
      <Link to="/" className="px-6 py-2.5 rounded-xl text-black text-sm font-semibold"
        style={{ background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }}>
        Home Par Jao
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-16 px-4 sm:px-6" style={{ background: "var(--bg-deep)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          <Link to="/" className="transition-colors" onMouseEnter={e=>e.currentTarget.style.color="var(--gold)"} onMouseLeave={e=>e.currentTarget.style.color="var(--text-muted)"}>{settings?.brandName || "Home"}</Link>
          <span>/</span>
          <span style={{ color: "var(--text-secondary)" }}>{page.title}</span>
        </div>

        {/* Title */}
        <h1 className="font-bold text-3xl sm:text-4xl mb-2" style={{ color: "var(--text-primary)" }}>{page.title}</h1>
        <div className="w-12 h-0.5 mb-8" style={{ background: "linear-gradient(90deg,#c9a84c,transparent)" }} />

        {/* Content */}
        {slug === "about-us" ? (
          <div className="space-y-10 font-sans mt-4">
            <div className="text-center space-y-4">
              <p className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--gold)" }}>Our Brand Story</p>
              <h2 className="text-4xl md:text-5xl font-extrabold" style={{ color: "var(--text-primary)" }}>Redefining Modern Streetwear.</h2>
              <p className="max-w-2xl mx-auto text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                URBAN THREADS was born out of a desire to blend luxury aesthetics with everyday streetwear. We believe that fashion is more than just clothing; it's a statement of identity, an expression of art, and a reflection of modern culture.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center mt-16">
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group">
                 <img src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80" alt="Brand Story" className="w-full h-full object-cover aspect-[4/5] group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>The Journey</h3>
                 <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                   What started as a small capsule collection has evolved into a full-fledged lifestyle brand. Our founders, deeply rooted in the hip-hop and underground fashion scenes, saw a gap in the market for high-quality, accessible luxury streetwear in Pakistan.
                 </p>
                 <blockquote className="border-l-4 pl-4 italic p-5 rounded-r-2xl shadow-sm" style={{ borderColor: "var(--gold)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                   "We don't just design clothes; we engineer confidence. Every thread, every seam, and every silhouette is crafted with precision."
                 </blockquote>
                 <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                   Today, URBAN THREADS stands as a symbol of rebellion, creativity, and uncompromising quality. Our materials are sourced globally, ensuring that every piece feels as premium as it looks.
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-16" style={{ borderTop: "1px solid var(--border-light)" }}>
               <div className="p-6 rounded-3xl text-center space-y-3 hover:-translate-y-2 transition-transform duration-300 shadow-sm border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-light)" }}>
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-black font-extrabold text-2xl gold-gradient shadow-inner">1</div>
                  <h4 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Premium Quality</h4>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>We use only the finest fabrics that stand the test of time and trends.</p>
               </div>
               <div className="p-6 rounded-3xl text-center space-y-3 hover:-translate-y-2 transition-transform duration-300 shadow-sm border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-light)" }}>
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-black font-extrabold text-2xl gold-gradient shadow-inner">2</div>
                  <h4 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Exclusive Drops</h4>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Limited quantity releases to ensure your style remains unique and exclusive.</p>
               </div>
               <div className="p-6 rounded-3xl text-center space-y-3 hover:-translate-y-2 transition-transform duration-300 shadow-sm border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-light)" }}>
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-black font-extrabold text-2xl gold-gradient shadow-inner">3</div>
                  <h4 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Ethical Craft</h4>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Proudly crafted under fair conditions with a focus on sustainable practices.</p>
               </div>
            </div>
          </div>
        ) : slug === "return-exchange-policy" || slug === "shipping-policy" ? (
          <div className="space-y-8 font-sans mt-4">
            <div className="text-center max-w-2xl mx-auto space-y-4">
               <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>{page.title}</h2>
               <p className="text-[15px]" style={{ color: "var(--text-secondary)" }}>
                 We want you to be completely satisfied with your purchase. If you are not entirely satisfied with your order, we are here to help.
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-8 rounded-3xl border transition-colors shadow-sm group" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-light)" }} onMouseOver={e=>e.currentTarget.style.borderColor="var(--gold)"} onMouseOut={e=>e.currentTarget.style.borderColor="var(--border-light)"}>
                 <h3 className="text-xl font-bold mb-4 group-hover:text-(--gold) transition-colors" style={{ color: "var(--text-primary)" }}>1. Eligibility for Returns</h3>
                 <ul className="space-y-3 text-[14px] list-disc pl-5" style={{ color: "var(--text-secondary)" }}>
                   <li>You have <b style={{ color: "var(--text-primary)" }}>7 calendar days</b> to return an item from the date you received it.</li>
                   <li>Your item must be <b style={{ color: "var(--text-primary)" }}>unused</b> and in the same condition that you received it.</li>
                   <li>Your item must be in the original packaging with all tags attached.</li>
                   <li>Items marked as "Final Sale" cannot be returned.</li>
                 </ul>
              </div>
              
              <div className="p-8 rounded-3xl border transition-colors shadow-sm group" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-light)" }} onMouseOver={e=>e.currentTarget.style.borderColor="var(--gold)"} onMouseOut={e=>e.currentTarget.style.borderColor="var(--border-light)"}>
                 <h3 className="text-xl font-bold mb-4 group-hover:text-(--gold) transition-colors" style={{ color: "var(--text-primary)" }}>2. Exchange Process</h3>
                 <p className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>We only replace items if they are defective, damaged, or if you received the wrong size. To initiate an exchange:</p>
                 <ol className="space-y-3 text-[14px] list-decimal pl-5" style={{ color: "var(--text-secondary)" }}>
                   <li>Contact our support team via WhatsApp or Email within 48 hours of delivery.</li>
                   <li>Provide your Order ID and photographic evidence of the issue.</li>
                   <li>Once approved, ship the item back to our warehouse.</li>
                   <li>We will dispatch the replacement item within 2-3 business days.</li>
                 </ol>
              </div>
            </div>

            <div className="p-8 rounded-3xl border mt-10 shadow-sm" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
               <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>3. Refunds & Shipping</h3>
               <p className="text-[14.5px] leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                 Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
               </p>
               <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                 If your return is approved, we will initiate a refund to your original method of payment (or via Bank Transfer/JazzCash for COD orders). You will receive the credit within 5-7 business days, depending on your card issuer's policies.
               </p>
               <div className="mt-6 border p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.05)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                 <h4 className="text-red-500 font-bold mb-2 text-sm">⚠️ Important Note on Shipping Costs</h4>
                 <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
               </div>
            </div>
          </div>
        ) : (
          <div
            className="prose max-w-none leading-relaxed space-y-4"
            style={{ fontSize: "13.5px", lineHeight: 1.8, color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {/* Back link */}
        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link to="/" className="text-sm hover:underline" style={{ color: "var(--gold)" }}>← Home par wapis jao</Link>
        </div>
      </div>
    </div>
  );
}
