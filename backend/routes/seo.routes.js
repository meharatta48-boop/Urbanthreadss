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

    // Check if the user is opening this directly in a browser
    const acceptHeader = req.headers.accept || "";
    if (acceptHeader.includes("text/html")) {
      // Users should never open this API route directly. Redirect to standard product page.
      return res.redirect(302, `https://urbanthreadss.store/product/${product._id}`);
    }

    // Otherwise, this is for og:image preview. Serve or redirect to the actual image.
    let image = "";
    if (product.images && product.images.length > 0) {
      image = product.images[0];
      if (!image.startsWith("http")) {
        const backendHost = "https://urbanthreadss.store";
        image = `${backendHost}${image.startsWith("/") ? "" : "/"}${image}`;
      }
    } else {
      // Fallback to site logo if product has no images
      image = "https://urbanthreadss.store/logo.png";
    }

    // Redirect to the actual image URL
    return res.redirect(302, image);
  } catch (error) {
    console.error("Error in social preview image route:", error);
    res.status(500).send("Error serving preview image");
  }
});


export default router;
