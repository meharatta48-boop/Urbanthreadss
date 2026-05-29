import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function PolicyPage({ type }) {
  const { settings, loading } = useSettings();

  // Determine which policy configuration to read based on "type" prop
  let title = "";
  let content = "";
  let metaTitle = "";
  let metaDesc = "";
  let isEnabled = true;

  if (settings) {
    if (type === "privacy") {
      title = settings.privacyPolicyTitle || "Privacy Policy";
      content = settings.privacyPolicyContent || "";
      metaTitle = settings.privacyPolicyMetaTitle || "Privacy Policy | Urban Thread";
      metaDesc = settings.privacyPolicyMetaDesc || "Privacy Policy of Urban Thread.";
      isEnabled = settings.privacyPolicyEnabled !== false;
    } else if (type === "terms") {
      title = settings.termsOfServiceTitle || "Terms of Service";
      content = settings.termsOfServiceContent || "";
      metaTitle = settings.termsOfServiceMetaTitle || "Terms of Service | Urban Thread";
      metaDesc = settings.termsOfServiceMetaDesc || "Terms of Service of Urban Thread.";
      isEnabled = settings.termsOfServiceEnabled !== false;
    } else if (type === "returns") {
      title = settings.returnPolicyTitle || "Return & Exchange Policy";
      content = settings.returnPolicyContent || "";
      metaTitle = settings.returnPolicyMetaTitle || "Return & Exchange Policy | Urban Thread";
      metaDesc = settings.returnPolicyMetaDesc || "Return and Exchange Policy of Urban Thread.";
      isEnabled = settings.returnPolicyEnabled !== false;
    } else if (type === "shipping") {
      title = settings.shippingInfoTitle || "Shipping Information";
      content = settings.shippingInfoContent || "";
      metaTitle = settings.shippingInfoMetaTitle || "Shipping Information | Urban Thread";
      metaDesc = settings.shippingInfoMetaDesc || "Shipping Information of Urban Thread.";
      isEnabled = settings.shippingInfoEnabled !== false;
    }
  }

  // Dynamic SEO meta updates
  useEffect(() => {
    if (!isEnabled || !settings) return;
    
    // Update Title
    if (metaTitle) {
      document.title = metaTitle;
    }

    // Update Meta Description
    if (metaDesc) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", metaDesc);
    }

    // Update Open Graph (OG) Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", metaTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", metaDesc);

  }, [metaTitle, metaDesc, isEnabled, settings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-deep)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--gold) transparent var(--gold) transparent" }} />
      </div>
    );
  }

  // Graceful disabled view if administrator toggled the page off
  if (!isEnabled) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4" style={{ background: "var(--bg-deep)" }}>
        <div className="text-center max-w-md p-8 rounded-3xl border border-(--border) bg-(--bg-card) shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            🔒
          </div>
          <div>
            <h1 className="text-xl font-bold text-(--text-primary) mb-2">Page Unavailable</h1>
            <p className="text-sm text-(--text-muted) leading-relaxed">
              This page has been temporarily deactivated by the website administrator. Please check back later.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block px-8 py-3 rounded-full text-black text-sm font-bold shadow-lg transform transition hover:scale-105"
            style={{ background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }}
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 transition-colors duration-500" style={{ background: "var(--bg-deep)" }}>
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs mb-8 overflow-hidden select-none" style={{ color: "var(--text-muted)" }}>
          <Link to="/" className="hover:text-(--gold) transition-colors">
            {settings?.brandName || "HOME"}
          </Link>
          <span className="opacity-50">/</span>
          <span className="uppercase font-bold tracking-wider" style={{ color: "var(--text-secondary)" }}>
            {title}
          </span>
        </div>

        {/* Dynamic Premium Header */}
        <div className="mb-10">
          <span
            className="inline-block px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.25em] font-bold mb-3 border border-(--gold)/20 bg-(--gold)/5"
            style={{ color: "var(--gold)" }}
          >
            Official Policy
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl leading-tight" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
          <div className="w-16 h-1 mt-4 rounded-full" style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />
        </div>

        {/* Premium Content Card */}
        <div
          className="p-6 sm:p-10 rounded-3xl border border-(--border) shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          {/* Subtle accent backdrop blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-(--gold)/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div
            className="policy-content relative z-10 leading-relaxed text-sm space-y-6"
            style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Dynamic scoped styles for premium rich HTML layouts */}
        <style dangerouslySetInnerHTML={{ __html: `
          .policy-content h2, .policy-content h3 {
            color: var(--text-primary) !important;
            font-family: var(--themeFontDisplay), Playfair Display, serif;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 0.8rem;
          }
          .policy-content h2 {
            font-size: 1.5rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.6rem;
            margin-top: 2.5rem;
          }
          .policy-content h3 {
            font-size: 1.2rem;
          }
          .policy-content p {
            margin-bottom: 1.2rem;
            color: var(--text-secondary);
          }
          .policy-content ul, .policy-content ol {
            margin-left: 1.5rem;
            margin-bottom: 1.2rem;
            list-style-type: disc;
            space-y: 0.4rem;
          }
          .policy-content li {
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
          }
          .policy-content strong {
            color: var(--text-primary);
            font-weight: 600;
          }
          .policy-content a {
            color: var(--gold);
            text-decoration: underline;
            transition: color 0.2s;
          }
          .policy-content a:hover {
            color: var(--gold-light);
          }
        `}} />

        {/* Go back helper */}
        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-(--gold) transition-all" style={{ color: "var(--text-muted)" }}>
            ← Back To Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
