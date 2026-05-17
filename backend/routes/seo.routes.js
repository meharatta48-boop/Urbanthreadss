import express from "express";
import SiteSettings from "../models/settings.model.js";
import CustomPage from "../models/customPage.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

router.get("/robots.txt", async (req, res) => {
  const settings = await SiteSettings.findOne().lean();
  const host = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || "http://localhost:5173";
  const robots = [
    "User-agent: *",
    `Allow: /`,
    `Sitemap: ${host.replace(/\/$/, "")}/api/seo/sitemap.xml`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(settings?.seoRobots ? `${robots}# ${settings.seoRobots}\n` : robots);
});

router.get("/sitemap.xml", async (req, res) => {
  const host = (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const pages = await CustomPage.find({ isVisible: true }).select("slug updatedAt").lean();
  const staticPaths = ["", "/shop", "/support", "/cart"];

  const urls = [
    ...staticPaths.map((p) => ({ loc: `${host}${p}`, lastmod: new Date().toISOString() })),
    ...pages.map((page) => ({
      loc: `${host}/${page.slug}`,
      lastmod: (page.updatedAt || new Date()).toISOString(),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
      (url) => `<url><loc>${url.loc}</loc><lastmod>${url.lastmod}</lastmod></url>`
    )
    .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  return res.status(200).send(xml);
});

router.get("/social-preview/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send("Not Found");

    const settings = await SiteSettings.findOne().lean();
    const brandName = settings?.brandName || "Urban Threads";
    const host = (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || "https://urbanthreadss.store").replace(/\/$/, "");

    const title = `${product.name} - ${brandName}`;
    const desc = product.description || `Buy ${product.name} online in Pakistan.`;
    
    // Convert cloudinary URI to URL if needed, assuming the image string is already a URL or path
    let image = "";
    if (product.images && product.images.length > 0) {
      image = product.images[0];
      if (!image.startsWith("http")) {
        image = `${host}${image.startsWith("/") ? "" : "/"}${image}`;
      }
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
  <meta http-equiv="refresh" content="0;url=${host}/product/${product._id}" />
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
