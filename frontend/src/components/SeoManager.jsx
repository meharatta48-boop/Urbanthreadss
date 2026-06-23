import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useProducts } from "../context/ProductContext";
import { useCategories } from "../context/CategoryContext";
import { useSubCategories } from "../context/SubCategoryContext";
import api, { SERVER_URL } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";

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
  const { pathname, search } = useLocation();
  const { settings } = useSettings();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { subCategories } = useSubCategories();

  const [activeProduct, setActiveProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  // Fetch or resolve product details dynamically for product page SEO
  useEffect(() => {
    if (pathname.startsWith("/product/")) {
      const productId = pathname.split("/product/")[1]?.split("/")[0];
      if (productId) {
        const found = products.find((p) => p._id === productId);
        if (found) {
          setActiveProduct(found);
        } else {
          setProductLoading(true);
          api.get(`/products/${productId}`)
            .then((res) => {
              const p = res.data.data || res.data.product;
              if (p) setActiveProduct(p);
            })
            .catch((err) => console.error("[SEO] Dynamic product fetch failed:", err))
            .finally(() => setProductLoading(false));
        }
      }
    } else {
      setActiveProduct(null);
    }
  }, [pathname, products]);

  useEffect(() => {
    if (!settings) return;

    const siteName = safeText(settings.brandName, "Urban Threads");
    const siteTitle = safeText(settings.siteTitle, siteName);
    const baseDesc = safeText(settings.defaultMetaDesc, "Premium streetwear from Pakistan.");
    const baseKeywords = safeText(settings.metaKeywords, "streetwear, pakistan fashion, urban threads");
    const locale = safeText(settings.seoLocale, "en_PK");
    const geoRegion = safeText(settings.seoGeoRegion, "PK-PB");
    const geoPlacename = safeText(settings.seoGeoPlacename, "Lahore");
    const geoPosition = safeText(settings.seoGeoPosition, "31.5204;74.3587");
    const robots = safeText(settings.seoRobots, "index,follow");
    const twitterHandle = safeText(settings.seoTwitterHandle, "");
    const tagline = safeText(settings.seoBrandTagline, "Pakistan ka premium streetwear brand.");

    const fallbackImage = settings.logoImage ? getImageUrl(settings.logoImage) : `${window.location.origin}/logo.png`;
    const imageUrlBase = safeText(settings.seoDefaultImage, fallbackImage);
    let imageUrl = imageUrlBase;
    const canonical = `${window.location.origin}${pathname}${search}`;

    let pageTitle = siteTitle;
    let pageDesc = baseDesc;
    let finalKeywords = baseKeywords;
    let isProductPage = false;

    // High quality targeted Pakistani search terms
    const pakistaniSeoKeywords = [
      "online shopping pakistan",
      "streetwear pakistan",
      "premium clothing pakistan",
      "COD pakistan",
      "delivery all over pakistan",
      "hoodies in pakistan",
      "oversized tees pakistan",
      "lahore clothing brand",
      "karachi online shopping",
      "islamabad fashion brand",
      "cotton clothing pakistani store",
      "streetwear brands in pakistan",
      "oversized t-shirts pakistan",
      "buy hoodies online pakistan",
      "mens oversized tees lahore",
      "unisex clothing brand karachi",
      "streetwear collection islamabad",
      "boys fashion clothing store",
      "street style fashion pakistan",
      "cash on delivery clothing",
      "urban threads pakistan",
      "unisex hoodies pakistan",
      "cargos in pakistan"
    ];

    if (pathname === "/") {
      pageTitle = `${siteName} | ${tagline}`;
      pageDesc = `${baseDesc} Cash on Delivery (COD) and fast shipping across Pakistan, including Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, and Faisalabad.`;
      finalKeywords = `${baseKeywords}, ${pakistaniSeoKeywords.join(", ")}`;
    } else if (pathname.startsWith("/shop")) {
      const queryParams = new URLSearchParams(search);
      const catId = queryParams.get("category");
      const subCatId = queryParams.get("subCategory");

      let filterName = "";
      if (subCatId) {
        const subCatObj = subCategories.find((s) => s._id === subCatId);
        if (subCatObj) filterName = subCatObj.name;
      } else if (catId) {
        const catObj = categories.find((c) => c._id === catId);
        if (catObj) filterName = catObj.name;
      }

      if (filterName) {
        const lowerFilter = filterName.toLowerCase();
        if (lowerFilter.includes("polo")) {
          pageTitle = `Buy Premium Polo Shirts Online in Pakistan | ${siteName}`;
          pageDesc = `Shop premium polo shirts for men at ${siteName}. Made from 100% breathable pique cotton with custom embroidery details. Fast Cash on Delivery (COD) across Pakistan.`;
          finalKeywords = `polo shirts pakistan, mens polo shirts online, pique polo tees lahore, premium polo brands pakistan, polo shirts price, COD, ${baseKeywords}`;
        } else if (lowerFilter.includes("casual shirt") || lowerFilter.includes("button down")) {
          pageTitle = `Premium Casual Shirts for Men in Pakistan | ${siteName}`;
          pageDesc = `Explore lightweight, modern-fit casual shirts for men at ${siteName}. Perfect for semi-formal or daily wear in Lahore, Karachi, & Islamabad. Easy exchanges & COD.`;
          finalKeywords = `casual shirts pakistan, buy mens shirts online, linen shirts lahore, cotton casual shirts karachi, cash on delivery shirts, ${baseKeywords}`;
        } else if (lowerFilter.includes("men") || lowerFilter.includes("clothing") || lowerFilter.includes("apparel")) {
          pageTitle = `Men's Premium Streetwear & Clothing in Pakistan | ${siteName}`;
          pageDesc = `Discover modern men's streetwear, oversized tees, hoodies, cargo pants, and aesthetic shirts at ${siteName}. Designed and manufactured in Pakistan. Nationwide fast delivery.`;
          finalKeywords = `mens clothing pakistan, pakistani streetwear brand, oversized t-shirts online, cargos lahore, boys fashion brand, COD, ${baseKeywords}`;
        } else {
          pageTitle = `Buy ${filterName} Online in Pakistan | ${siteName}`;
          pageDesc = `Explore premium ${filterName} online at ${siteName}. High-quality fabrics, modern streetwear fits, and fast Cash on Delivery (COD) all over Pakistan.`;
          finalKeywords = `${filterName.toLowerCase()}, buy ${filterName.toLowerCase()} pakistan, streetwear brand pakistan, oversized clothing lahore, ${baseKeywords}`;
        }
      } else {
        pageTitle = `Shop Latest Streetwear & Pakistani Fashion | ${siteName}`;
        pageDesc = `Browse the latest collection of premium hoodies, cargo pants, oversized tees, activewear, and accessories online at ${siteName}. Nationwide fast delivery.`;
        finalKeywords = `shop online, clothing sale pakistan, streetwear sale, ${baseKeywords}`;
      }
    } else if (pathname.startsWith("/product/")) {
      isProductPage = true;
      if (activeProduct) {
        pageTitle = `Buy ${activeProduct.name} Online in Pakistan - Rs. ${activeProduct.price?.toLocaleString()} | ${siteName}`;
        pageDesc = `Get ${activeProduct.name} at ${siteName} for Rs. ${activeProduct.price?.toLocaleString()}. ${activeProduct.description || "Original quality product."} Cash on Delivery available all over Pakistan with 2-5 days fast delivery.`;
        
        if (activeProduct.images?.length > 0) {
          imageUrl = getImageUrl(activeProduct.images[0]);
        }
        
        const prodKeywords = [
          activeProduct.name?.toLowerCase(),
          activeProduct.category?.name?.toLowerCase(),
          activeProduct.subCategory?.name?.toLowerCase(),
          `buy ${activeProduct.name?.toLowerCase()} pakistan`,
          `${activeProduct.name?.toLowerCase()} price in pakistan`,
          `${activeProduct.name?.toLowerCase()} online lahore`,
          `${activeProduct.name?.toLowerCase()} shopping karachi`,
          "streetwear clothes pakistan",
          "cash on delivery clothing store"
        ].filter(Boolean);
        finalKeywords = `${prodKeywords.join(", ")}, ${baseKeywords}`;
      } else {
        pageTitle = `Product Details | ${siteName}`;
        pageDesc = `${baseDesc} Premium quality products. Cash on Delivery and nationwide shipping across Pakistan.`;
      }
    } else if (pathname.startsWith("/support")) {
      pageTitle = `Customer Support & Size Guide | ${siteName}`;
      pageDesc = `Need help? Contact ${siteName} customer support. Get details about size guides, order tracking, fast shipping, and easy 7-day returns in Pakistan.`;
      finalKeywords = `support, size guide, order tracking pakistan, urban thread support`;
    } else if (pathname.startsWith("/about")) {
      pageTitle = `Our Story & Vision | ${siteName} Streetwear`;
      pageDesc = `Learn about the journey of ${siteName}, bringing premium streetwear culture and top-notch apparel manufacturing to fashion enthusiasts in Pakistan.`;
      finalKeywords = `about us, brand story, premium manufacturing pakistan`;
    } else if (pathname.startsWith("/cart")) {
      pageTitle = `Your Shopping Cart | ${siteName}`;
      pageDesc = `Review your premium clothing items in your cart. Proceed to checkout for secure Cash on Delivery (COD) across Pakistan.`;
    } else if (pathname.startsWith("/checkout")) {
      pageTitle = `Secure Checkout | ${siteName}`;
      pageDesc = `Provide your delivery details to complete your order. Safe and secure Cash on Delivery available for all cities in Pakistan.`;
    }

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: "description", content: pageDesc });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: finalKeywords });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[name="geo.region"]', { name: "geo.region", content: geoRegion });
    upsertMeta('meta[name="geo.placename"]', { name: "geo.placename", content: geoPlacename });
    upsertMeta('meta[name="geo.position"]', { name: "geo.position", content: geoPosition });
    upsertMeta('meta[name="ICBM"]', { name: "ICBM", content: geoPosition });

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: isProductPage ? "product" : "website" });
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

    // Schema.org LD+JSON Structured Data
    let jsonLd = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: siteName,
      description: baseDesc,
      image: imageUrl,
      url: window.location.origin,
      priceRange: "PKR",
      logo: fallbackImage,
      address: {
        "@type": "PostalAddress",
        addressLocality: geoPlacename,
        addressRegion: geoRegion,
        addressCountry: "PK",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: geoPosition.split(";")[0] || "31.5204",
        longitude: geoPosition.split(";")[1] || "74.3587"
      },
      areaServed: {
        "@type": "Country",
        name: "Pakistan"
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        opens: "00:00",
        closes: "23:59"
      },
      sameAs: [
        safeText(settings.instagram, ""),
        safeText(settings.facebook, ""),
        safeText(settings.youtube, ""),
        safeText(settings.tiktok, "")
      ].filter(Boolean),
      telephone: safeText(settings.phone, ""),
      email: safeText(settings.email, "")
    };

    if (isProductPage && activeProduct) {
      const avgRating = activeProduct.rating || 5;
      const numReviews = activeProduct.numReviews || 0;

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: activeProduct.name,
        description: activeProduct.description || pageDesc,
        image: imageUrl,
        sku: activeProduct._id,
        mpn: activeProduct._id,
        brand: {
          "@type": "Brand",
          name: siteName
        },
        offers: {
          "@type": "Offer",
          price: activeProduct.price,
          priceCurrency: "PKR",
          itemCondition: "https://schema.org/NewCondition",
          availability: activeProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: canonical,
          priceValidUntil: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
          seller: {
            "@type": "Organization",
            name: siteName,
            url: window.location.origin,
          },
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: activeProduct.price,
            priceCurrency: "PKR",
            valueAddedTaxIncluded: true
          }
        }
      };

      if (numReviews > 0) {
        jsonLd.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: avgRating.toString(),
          reviewCount: numReviews.toString(),
          bestRating: "5",
          worstRating: "1"
        };
        
        jsonLd.review = activeProduct.reviews.map(r => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: r.name || "Customer"
          },
          datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          reviewBody: r.comment || "",
          reviewRating: {
            "@type": "Rating",
            ratingValue: (r.rating || 5).toString(),
            bestRating: "5"
          }
        }));
      }
    }

    let scriptEl = document.getElementById("ut-seo-jsonld");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "ut-seo-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);
  }, [pathname, search, settings, activeProduct, categories, subCategories]);

  return null;
}
