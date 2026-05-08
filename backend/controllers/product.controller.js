import fs from "fs";
import path from "path";
import Product from "../models/product.model.js";

const MAX_LIMIT = 100;
const parsePositiveInt = (value, fallback) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

/* ─── HELPERS ─── */
const deleteFile = (filePath) => {
  if (!filePath) return;
  const full = path.join(path.resolve(), filePath.replace(/^\//, ""));
  if (fs.existsSync(full)) fs.unlinkSync(full);
};

// FormData sends arrays as JSON strings e.g. '["S","M","L"]'
// or as multiple fields, or as comma-separated strings
const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  const str = String(val).trim();
  // JSON array string: '["S","M"]'
  if (str.startsWith('[')) {
    try { return JSON.parse(str).filter(Boolean); } catch { /* fall through */ }
  }
  // Comma-separated fallback: "S,M,L"
  return str.split(',').map((s) => s.trim()).filter(Boolean);
};

/* ─── GET ALL ─── */
export const getProducts = async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), MAX_LIMIT);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .select("name price images category subCategory stock isFeatured isActive createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.max(1, Math.ceil(total / limit));
    res.status(200).json({
      success: true,
      data: products,
      total,
      page,
      limit,
      pages,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ─── GET BY ID ─── */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .lean();
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/* ─── CREATE ─── */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name, price, category, subCategory, description,
      stock, comparePrice, isFeatured, isActive,
    } = req.body;

    if (!name || !price || !category)
      return res.status(400).json({ success: false, message: "Name, price and category required" });

    // req.files is now an object: { images: [...], productVideo: [...] }
    const imageFiles = req.files?.images || [];
    const videoFile  = req.files?.productVideo?.[0] || null;

    const images = imageFiles.map((f) => f.path);
    const video  = videoFile ? videoFile.path : "";

    // Parse sizes & colors arrays from FormData
    const sizes = parseArray(req.body.sizes);
    const colors = parseArray(req.body.colors);

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : 0,
      category,
      subCategory: subCategory || null,
      description: description || "",
      images,
      video,
      stock: Number(stock) || 0,
      sizes,
      colors,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isActive: isActive !== "false" && isActive !== false,
    });

    const populated = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subCategory", "name");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/* ─── UPDATE ─── */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name, price, category, subCategory, description,
      stock, keepImages, comparePrice, isFeatured, isActive, removeVideo,
    } = req.body;

    // Parse sizes & colors
    const sizes = req.body.sizes !== undefined ? parseArray(req.body.sizes) : product.sizes;
    const colors = req.body.colors !== undefined ? parseArray(req.body.colors) : product.colors;

    // Images to keep
    let imagesToKeep = [];
    if (keepImages) {
      try { imagesToKeep = JSON.parse(keepImages); } catch { imagesToKeep = []; }
    } else {
      imagesToKeep = product.images; // keep all if not specified
    }

    // Delete removed images from disk
    product.images.forEach((img) => {
      if (!imagesToKeep.includes(img)) deleteFile(img);
    });

    // New uploaded images (req.files is now an object from fields())
    const imageFiles = req.files?.images || [];
    const newImages = imageFiles.map((f) => f.path);
    product.images = [...imagesToKeep, ...newImages];

    // --- VIDEO handling ---
    const videoFile = req.files?.productVideo?.[0] || null;
    if (videoFile) {
      // New video uploaded — delete old one
      if (product.video) deleteFile(product.video);
      product.video = videoFile.path;
    } else if (removeVideo === "true" || removeVideo === true) {
      // Admin explicitly removed the video
      if (product.video) deleteFile(product.video);
      product.video = "";
    }
    // else: keep existing video unchanged

    product.name = name?.trim() ?? product.name;
    product.price = price ? Number(price) : product.price;
    product.comparePrice = comparePrice !== undefined ? Number(comparePrice) : product.comparePrice;
    product.category = category ?? product.category;
    product.subCategory = subCategory || product.subCategory;
    product.description = description ?? product.description;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.sizes = sizes;
    product.colors = colors;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === "true" || isFeatured === true;
    if (isActive !== undefined) product.isActive = isActive !== "false" && isActive !== false;

    await product.save();

    const updated = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subCategory", "name");

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/* ─── DELETE SINGLE IMAGE ─── */
export const deleteProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imagePath } = req.body;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    product.images = product.images.filter((img) => img !== imagePath);
    await product.save();
    deleteFile(imagePath);

    res.json({ success: true, message: "Image deleted", images: product.images });
  } catch (error) {
    next(error);
  }
};

/* ─── DELETE PRODUCT ─── */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    product.images.forEach((img) => deleteFile(img));
    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

/* ─── ADD PRODUCT REVIEW (authenticated user) ─── */
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!comment?.trim()) return res.status(400).json({ success: false, message: "Comment zaroori hai" });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating 1-5 ke beech honi chahiye" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Check already reviewed
    const already = product.reviews.find((r) => r.user?.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: "Aap pehle hi is product ki review de chuke hain" });

    // --- Handle uploaded media files ---
    const uploadedImages = [];
    let uploadedVideo = "";

    if (req.files && Array.isArray(req.files)) {
      // multer fields() gives an object; array() gives an array
      req.files.forEach((f) => {
        if (f.fieldname === "reviewVideo" && f.mimetype.startsWith("video/")) {
          uploadedVideo = f.path;
        } else if (f.fieldname === "reviewImages" || f.mimetype.startsWith("image/")) {
          if (uploadedImages.length < 4) uploadedImages.push(f.path);
        }
      });
    } else if (req.files && typeof req.files === "object") {
      // fields() style: { reviewImages: [...], reviewVideo: [...] }
      (req.files.reviewImages || []).slice(0, 4).forEach((f) => uploadedImages.push(f.path));
      const vid = (req.files.reviewVideo || [])[0];
      if (vid) uploadedVideo = vid.path;
    }

    product.reviews.push({
      user:    req.user._id,
      name:    req.user.name,
      rating:  Number(rating),
      comment: comment.trim(),
      images:  uploadedImages,
      video:   uploadedVideo,
    });

    // Recalculate avg
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: "Review add ho gayi!", reviews: product.reviews, rating: product.rating, numReviews: product.numReviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── DELETE PRODUCT REVIEW (admin or own review) ─── */
export const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    // Only admin or review owner can delete
    if (review.user?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Permission nahi hai" });
    }

    product.reviews = product.reviews.filter((r) => r._id.toString() !== req.params.reviewId);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0;
    await product.save();

    res.json({ success: true, message: "Review delete ho gayi", reviews: product.reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

