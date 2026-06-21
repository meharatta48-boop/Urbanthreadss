import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import errorHandler from "./middleware/error.middleware.js";
import { requestContext, requestLogger } from "./middleware/requestContext.middleware.js";
import { trackVisitor } from "./utils/visitorTracker.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subCategoryRoutes from "./routes/subCategory.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import navLinkRoutes from "./routes/navLink.routes.js";
import customPageRoutes from "./routes/customPage.routes.js";
import seoRoutes from "./routes/seo.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import comboRoutes from "./routes/comboOffer.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import faqRoutes from "./routes/faq.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import activityLogRoutes from "./routes/activityLog.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const allowedOrigins = new Set([
  "https://urbanthreadss.store",
  "https://www.urbanthreadss.store",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(requestContext);
app.use(trackVisitor);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));
app.use(compression({
  level: 6, // Good balance between speed and compression
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress images, videos, or already compressed files
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX || "300", 10),
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(requestLogger);

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  maxAge: "30d",
  etag: true,
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
  },
}));

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/nav-links", navLinkRoutes);
app.use("/api/pages", customPageRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/combos", comboRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/ai", aiRoutes);

// Serve static files from frontend build if available
const frontendPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath, {
    etag: true,
    maxAge: "7d",
    setHeaders: (res, filePath) => {
      const isHtml = filePath.endsWith(".html");
      const isHashedAsset = /assets[\\/].+\.[a-f0-9]{8,}\./i.test(filePath);
      if (isHtml) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        return;
      }
      if (isHashedAsset) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return;
      }
      res.setHeader("Cache-Control", "public, max-age=604800");
    },
  }));

  // SPA fallback - serve index.html for all non-API routes with dynamic SEO preview for bots
  app.get("*", async (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.includes(".") || req.path.startsWith("/assets")) {
      return next();
    }
    
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const indexPath = path.join(frontendPath, "index.html");

    // Detect if the request comes from a crawler/bot
    const isBot = /bot|facebook|whatsapp|twitter|pinterest|slack|linkedin|skype|discord|telegram|viber/i.test(req.headers['user-agent'] || '');

    if (isBot) {
      try {
        // Dynamic imports to avoid circular dependency
        const Product = (await import("./models/product.model.js")).default;
        const SiteSettings = (await import("./models/settings.model.js")).default;

        const settings = await SiteSettings.findOne().lean();
        const brandName = settings?.brandName || "URBAN THREADS";
        const baseTitle = settings?.siteTitle || brandName;
        const baseDesc = settings?.defaultMetaDesc || "Premium men's & women's fashion in Pakistan.";
        
        let host = "https://www.urbanthreadss.store";
        if (process.env.PUBLIC_SITE_URL) {
          host = process.env.PUBLIC_SITE_URL;
        } else if (process.env.FRONTEND_URL) {
          const urls = process.env.FRONTEND_URL.split(",");
          const prodUrl = urls.find(u => u.includes("urbanthreadss.store"));
          if (prodUrl) host = prodUrl;
          else if (urls.length > 0 && !urls[0].includes("localhost")) host = urls[0];
        }
        host = host.trim().replace(/\/$/, "");

        const getAbsoluteUrl = (pathStr) => {
          if (!pathStr) return `${host}/ut.png`;
          
          if (pathStr.startsWith("http://") || pathStr.startsWith("https://")) {
            let url = pathStr;
            if (url.startsWith("http://") && !url.includes("localhost")) {
              url = url.replace("http://", "https://");
            }
            return url.replace(/\\/g, "/");
          }

          // Check if local file exists
          const cleanPath = pathStr.replace(/^\//, "");
          const localPath = path.join(__dirname, cleanPath);
          if (fs.existsSync(localPath)) {
            let backendHost = req.protocol + "://" + req.get("host");
            if (backendHost.startsWith("http://") && !backendHost.includes("localhost")) {
              backendHost = backendHost.replace("http://", "https://");
            }
            return `${backendHost.replace(/\/$/, "")}/${cleanPath}`.replace(/\\/g, "/");
          }

          // Fallback to static logo on Vercel domain
          return `${host}/ut.png`;
        };

        let fallbackImage = settings?.logoImage ? settings.logoImage : "/ut.png";
        let defaultSeoImg = settings?.seoDefaultImage || fallbackImage;
        let image = getAbsoluteUrl(defaultSeoImg);

        let title = baseTitle;
        let desc = baseDesc;
        let urlPath = req.originalUrl || req.path;
        let pageUrl = `${host}${urlPath}`;

        // Parse route-specific details
        if (req.path.startsWith("/product/")) {
          const productId = req.path.split("/product/")[1]?.split("/")[0];
          if (productId && productId.match(/^[0-9a-fA-F]{24}$/)) {
            const product = await Product.findById(productId).lean();
            if (product) {
              title = `${product.name} - ${brandName}`;
              desc = product.description ? product.description.substring(0, 160) : `Buy ${product.name} online in Pakistan.`;
              if (product.images && product.images.length > 0) {
                image = getAbsoluteUrl(product.images[0]);
              }
            }
          }
        } else if (req.path.startsWith("/page/")) {
          const slug = req.path.split("/page/")[1]?.split("/")[0];
          if (slug) {
            const CustomPage = (await import("./models/customPage.model.js")).default;
            const page = await CustomPage.findOne({ slug, isVisible: true }).lean();
            if (page) {
              title = `${page.title} - ${brandName}`;
              desc = page.metaDescription || baseDesc;
            }
          }
        } else if (req.path.startsWith("/shop")) {
          if (req.query.category) {
            const Category = (await import("./models/category.model.js")).default;
            const cat = await Category.findById(req.query.category).lean();
            if (cat) {
              title = `Buy ${cat.name} Online - ${brandName}`;
              desc = `Shop premium ${cat.name} clothing online at ${brandName}.`;
              if (cat.image) image = getAbsoluteUrl(cat.image);
            }
          } else if (req.query.subCategory) {
            const SubCategory = (await import("./models/subCategory.model.js")).default;
            const subcat = await SubCategory.findById(req.query.subCategory).lean();
            if (subcat) {
              title = `Buy ${subcat.name} Online - ${brandName}`;
              desc = `Explore premium ${subcat.name} online at ${brandName}.`;
              if (subcat.image) image = getAbsoluteUrl(subcat.image);
            }
          }
        } else if (req.path.startsWith("/about")) {
          title = `About Us - ${brandName}`;
          desc = settings?.aboutUsStory || `Learn more about ${brandName} and our vision.`;
          if (settings?.brandStoryImage) image = getAbsoluteUrl(settings.brandStoryImage);
        }

        // Return a lightweight, standalone HTML file specifically for crawler bots
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${desc}" />
  <meta property="og:type" content="${req.path.startsWith("/product/") ? "product" : "website"}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:site_name" content="${brandName}" />
  <meta property="og:locale" content="en_PK" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${pageUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />
  <link rel="canonical" href="${pageUrl}" />
</head>
<body>
  <script>window.location.replace("${pageUrl}");</script>
</body>
</html>`;

        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
      } catch (err) {
        console.error("[SEO Crawler Intercept Error]:", err);
      }
    }

    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return res.status(200).send("Urban Threads Store is running! API Active.");
  });
} else {
  console.warn(`Frontend build not found at ${frontendPath}. Static asset serving is disabled.`);
}

app.use(errorHandler);

export default app;
