import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";

const API_BASE = SERVER_URL;

const upsertMeta = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

const upsertLink = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

const safeText = (value, fallback = "") => (typeof value === "string" ? value.trim() : fallback);

export default function SeoManager() {
  const { pathname } = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const siteName = safeText(settings.brandName, "Urban Thread");
    const siteTitle = safeText(settings.siteTitle, siteName);
    const baseDesc = safeText(settings.defaultMetaDesc, "Premium streetwear from Pakistan.");
    const baseKeywords = safeText(settings.metaKeywords, "streetwear, pakistan fashion, urban thread");
    const locale = safeText(settings.seoLocale, "en_PK");
    const geoRegion = safeText(settings.seoGeoRegion, "PK-PB");
    const geoPlacename = safeText(settings.seoGeoPlacename, "Lahore");
    const geoPosition = safeText(settings.seoGeoPosition, "31.5204;74.3587");
    const robots = safeText(settings.seoRobots, "index,follow");
    const twitterHandle = safeText(settings.seoTwitterHandle, "");
    const tagline = safeText(settings.seoBrandTagline, "Pakistan ka premium streetwear brand.");

    const fallbackImage = settings.logoImage ? getImageUrl(settings.logoImage) : `${window.location.origin}/logo.png`;
    const imageUrl = safeText(settings.seoDefaultImage, fallbackImage);
    const canonical = `${window.location.origin}${pathname}`;

    let pageTitle = siteTitle;
    let pageDesc = baseDesc;

    if (pathname === "/") {
      pageTitle = `${siteName} | ${tagline}`;
      pageDesc = `${baseDesc} Fast delivery all over Pakistan. COD available in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad and more.`;
    } else if (pathname.startsWith("/shop")) {
      pageTitle = `Shop ${siteName} | Latest Pakistani Fashion`;
      pageDesc = `Buy latest ${siteName} articles online in Pakistan. ${baseDesc}`;
    } else if (pathname.startsWith("/product/")) {
      pageTitle = `Product Details | ${siteName}`;
      pageDesc = `${baseDesc} Original quality, nationwide delivery in Pakistan.`;
    } else if (pathname.startsWith("/support")) {
      pageTitle = `Support | ${siteName}`;
      pageDesc = `Need help? Contact ${siteName} support for orders, delivery, size guide and returns in Pakistan.`;
    }

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: "description", content: pageDesc });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: baseKeywords });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[name="geo.region"]', { name: "geo.region", content: geoRegion });
    upsertMeta('meta[name="geo.placename"]', { name: "geo.placename", content: geoPlacename });
    upsertMeta('meta[name="geo.position"]', { name: "geo.position", content: geoPosition });
    upsertMeta('meta[name="ICBM"]', { name: "ICBM", content: geoPosition });

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: siteName });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: pageDesc });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: locale });

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: pageDesc });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    if (twitterHandle) upsertMeta('meta[name="twitter:site"]', { name: "twitter:site", content: twitterHandle });

    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonical });

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: siteName,
      description: baseDesc,
      image: imageUrl,
      url: window.location.origin,
      address: {
        "@type": "PostalAddress",
        addressLocality: geoPlacename,
        addressRegion: geoRegion,
        addressCountry: "PK",
      },
      areaServed: "Pakistan",
    };

    let scriptEl = document.getElementById("ut-seo-jsonld");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "ut-seo-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);
  }, [pathname, settings]);

  return null;
}
