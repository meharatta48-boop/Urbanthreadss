import express from "express";
import SiteSettings from "../models/settings.model.js";
import CustomPage from "../models/customPage.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";

const router = express.Router();

router.get("/robots.txt", async (req, res) => {
  const settings = await SiteSettings.findOne().lean();
  const host = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || "http://localhost:5173";
  const robots = [
    "User-agent: *",
    `Allow: /`,
    `Disallow: /admin`,
    `Disallow: /checkout`,
    `Disallow: /cart`,
    `Disallow: /login`,
    `Disallow: /signup`,
    `Sitemap: ${host.replace(/\/$/, "")}/api/seo/sitemap.xml`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(settings?.seoRobots ? `${robots}# ${settings.seoRobots}\n` : robots);
});

router.get("/sitemap.xml", async (req, res) => {
  try {
    const host = (
      process.env.PUBLIC_SITE_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    ).replace(/\/$/, "");

    const now = new Date().toISOString();

    // Static high-priority pages
    const staticUrls = [
      { loc: `${host}/`,        priority: "1.0",  changefreq: "daily"   },
      { loc: `${host}/shop`,    priority: "0.9",  changefreq: "daily"   },
      { loc: `${host}/support`, priority: "0.5",  changefreq: "monthly" },
    ].map((u) => ({ ...u, lastmod: now }));

    // Custom pages (blog, about, policies, etc.)
    const customPages = await CustomPage.find({ isVisible: true })
      .select("slug updatedAt")
      .lean();
    const customPageUrls = customPages.map((p) => ({
      loc:        `${host}/${p.slug}`,
      lastmod:    (p.updatedAt || new Date()).toISOString(),
      priority:   "0.6",
      changefreq: "weekly",
    }));

    // Active product pages
    const products = await Product.find({ isActive: { $ne: false } })
      .select("_id updatedAt")
      .lean();
    const productUrls = products.map((p) => ({
      loc:        `${host}/product/${p._id}`,
      lastmod:    (p.updatedAt || new Date()).toISOString(),
      priority:   "0.8",
      changefreq: "weekly",
    }));

    // Active category pages  — /shop?category=SLUG
    const categories = await Category.find({ isActive: { $ne: false } })
      .select("name updatedAt")
      .lean();
    const categoryUrls = categories.map((c) => ({
      loc:        `${host}/shop?category=${encodeURIComponent(c.name)}`,
      lastmod:    (c.updatedAt || new Date()).toISOString(),
      priority:   "0.75",
      changefreq: "weekly",
    }));

    // Active subcategory pages — /shop?subcategory=SLUG
    const subCategories = await SubCategory.find({ isActive: { $ne: false } })
      .select("name updatedAt")
      .lean();
    const subCategoryUrls = subCategories.map((s) => ({
      loc:        `${host}/shop?subcategory=${encodeURIComponent(s.name)}`,
      lastmod:    (s.updatedAt || new Date()).toISOString(),
      priority:   "0.7",
      changefreq: "weekly",
    }));

    const allUrls = [
      ...staticUrls,
      ...customPageUrls,
      ...categoryUrls,
      ...subCategoryUrls,
      ...productUrls,
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1 hour
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[sitemap.xml error]", err);
    return res.status(500).send("Error generating sitemap");
  }
});

router.get("/social-preview/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send("Not Found");

    const settings = await SiteSettings.findOne().lean();
    const brandName = settings?.brandName || "Urban Threads";
    
    // Parse single valid frontend redirect target
    let host = "https://www.urbanthreadss.store";
    if (process.env.PUBLIC_SITE_URL) {
      host = process.env.PUBLIC_SITE_URL;
    } else if (process.env.FRONTEND_URL) {
      const urls = process.env.FRONTEND_URL.split(",");
      const prodUrl = urls.find(u => u.includes("urbanthreadss.store"));
      if (prodUrl) {
        host = prodUrl;
      } else if (urls.length > 0 && !urls[0].includes("localhost")) {
        host = urls[0];
      }
    }
    host = host.trim().replace(/\/$/, "");

    const title = `${product.name} - ${brandName}`;
    const desc = product.description || `Buy ${product.name} online in Pakistan.`;
    
    // Convert cloudinary URI to URL if needed, assuming the image string is already a URL or path
    let image = "";
    const fallbackImage = settings?.seoDefaultImage || settings?.logoImage || "/ut.png";

    if (product.images && product.images.length > 0) {
      const firstImg = product.images[0];
      if (firstImg.startsWith("http")) {
        image = firstImg;
      } else {
        const fs = await import("fs");
        const path = await import("path");
        const fileURLToPath = await import("url").then(m => m.fileURLToPath);
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        const localPath = path.join(dirname, "..", firstImg.replace(/^\//, ""));
        if (fs.existsSync(localPath)) {
          image = firstImg;
        } else {
          image = fallbackImage;
        }
      }
    } else {
      image = fallbackImage;
    }

    if (!image.startsWith("http")) {
      let backendHost = req.protocol + "://" + req.get("host");
      if (backendHost.startsWith("http://") && !backendHost.includes("localhost")) {
        backendHost = backendHost.replace("http://", "https://");
      }
      image = `${backendHost.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
    } else if (image.startsWith("http://") && !image.includes("localhost")) {
      image = image.replace("http://", "https://");
    }

    // Standardize all backslashes to forward slashes for standard URLs
    if (image) {
      image = image.replace(/\\/g, "/");
    }

  const isBot = /bot|facebook|whatsapp|twitter|pinterest|slack|linkedin|skype|discord|telegram|viber/i.test(req.headers['user-agent'] || '');

    if (!isBot) {
      return res.redirect(301, `${host}/product/${product._id}`);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${host}/product/${product._id}" />
  <meta property="og:type" content="product" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body>
  <script>window.location.replace("${host}/product/${product._id}");</script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send("Error generating preview");
  }
});


export default router;
