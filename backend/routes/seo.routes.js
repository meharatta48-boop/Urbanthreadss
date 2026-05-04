import express from "express";
import SiteSettings from "../models/settings.model.js";
import CustomPage from "../models/customPage.model.js";

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

export default router;
