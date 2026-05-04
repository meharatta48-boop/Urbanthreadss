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
        <div
          className="prose max-w-none leading-relaxed space-y-4"
          style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--text-secondary)" }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Back link */}
        <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link to="/" className="text-sm hover:underline" style={{ color: "var(--gold)" }}>← Home par wapis jao</Link>
        </div>
      </div>
    </div>
  );
}
