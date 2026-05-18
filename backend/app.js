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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const allowedOrigins = new Set([
  "https://urbanthreadss.store",
  "https://www.urbanthreadss.store",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(requestContext);
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

  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use(errorHandler);

export default app;
