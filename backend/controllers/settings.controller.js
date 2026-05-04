import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import SiteSettings from "../models/settings.model.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { prepareSettingsPatch } from "../services/settings.service.js";
import { normalizeStoredImagePath, toAbsoluteUploadFsPath } from "../utils/mediaPath.util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "..", "uploads");

const deleteFile = (filePath) => {
  if (!filePath) return;
  const full = toAbsoluteUploadFsPath(filePath, uploadsRoot);
  if (full && fs.existsSync(full)) fs.unlinkSync(full);
};

const normalizeSettingsMedia = (settings) => {
  if (!settings) return settings;
  const json = settings.toObject ? settings.toObject() : { ...settings };

  const heroSlides = Array.isArray(json.heroSlides)
    ? json.heroSlides.map((slide) => ({
      ...slide,
      image: normalizeStoredImagePath(slide?.image),
    }))
    : [];

  return {
    ...json,
    logoImage: normalizeStoredImagePath(json.logoImage),
    logoMobileImage: normalizeStoredImagePath(json.logoMobileImage),
    faviconUrl: normalizeStoredImagePath(json.faviconUrl),
    brandImage: normalizeStoredImagePath(json.brandImage),
    popupImage: normalizeStoredImagePath(json.popupImage),
    seoDefaultImage: normalizeStoredImagePath(json.seoDefaultImage),
    heroSlides,
    heroImages: Array.isArray(json.heroImages)
      ? json.heroImages.map((img) => normalizeStoredImagePath(img)).filter(Boolean)
      : [],
  };
};

/* ─── GET SETTINGS (public) ─── */
export const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    return sendSuccess(res, { settings: normalizeSettingsMedia(settings) });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── UPDATE TEXT SETTINGS (admin) ─── */
export const updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(prepareSettingsPatch(req.body));
    } else {
      Object.assign(settings, prepareSettingsPatch(req.body));
      await settings.save();
    }
    return sendSuccess(res, { settings, message: "Settings saved" });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ─── UPLOAD HERO IMAGE FOR SPECIFIC SLIDE (admin) ─── */
export const uploadSlideImage = async (req, res) => {
  try {
    const { slideIndex } = req.body;
    const idx = parseInt(slideIndex ?? 0, 10);

    if (!req.file)
      return res.status(400).json({ success: false, message: "No image uploaded" });

    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    // Ensure slides array has at least 3 elements
    while (settings.heroSlides.length < 3) {
      settings.heroSlides.push({ image: "", label: "", title: "", subtitle: "", cta: "" });
    }

    // Delete old image for this slide
    const oldImg = settings.heroSlides[idx]?.image;
    if (oldImg) deleteFile(oldImg);

    settings.heroSlides[idx].image = req.file.path;

    // Also keep heroImages in sync (legacy)
    settings.heroImages = settings.heroSlides.map((s) => s.image).filter(Boolean);

    settings.markModified("heroSlides");
    await settings.save();

    res.json({ success: true, heroSlides: settings.heroSlides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── UPLOAD HERO IMAGES — legacy bulk (admin) ─── */
export const uploadHeroImages = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ success: false, message: "No images uploaded" });

    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    const newPaths = req.files.map((f) => f.path);
    settings.heroImages = [...(settings.heroImages || []), ...newPaths].slice(0, 5);
    await settings.save();

    res.json({ success: true, heroImages: settings.heroImages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── DELETE HERO IMAGE (admin) ─── */
export const deleteHeroImage = async (req, res) => {
  try {
    const { imagePath } = req.body;
    let settings = await SiteSettings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: "Not found" });

    settings.heroImages = (settings.heroImages || []).filter((img) => img !== imagePath);
    // Also clear from heroSlides
    settings.heroSlides.forEach((slide) => { if (slide.image === imagePath) slide.image = ""; });
    settings.markModified("heroSlides");
    await settings.save();
    deleteFile(imagePath);

    res.json({ success: true, heroImages: settings.heroImages, heroSlides: settings.heroSlides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── UPLOAD BRAND STORY IMAGE (admin) ─── */
export const uploadBrandImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image" });
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    if (settings.brandImage) deleteFile(settings.brandImage);
    settings.brandImage = req.file.path;
    await settings.save();
    res.json({ success: true, brandImage: settings.brandImage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── UPLOAD LOGO / FAVICON (admin) ─── */
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image" });
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    // field param controls which DB field is updated
    const allowed = ["logoImage", "logoMobileImage", "faviconUrl", "popupImage"];
    const field = allowed.includes(req.body.field) ? req.body.field : "logoImage";

    if (settings[field]) deleteFile(settings[field]);
    settings[field] = req.file.path;
    await settings.save();
    res.json({ success: true, [field]: settings[field] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── DELETE SINGLE SETTING IMAGE (admin) — logo / favicon / brand ─── */
export const deleteSettingImage = async (req, res) => {
  try {
    const { field } = req.body;
    const allowed = ["logoImage", "logoMobileImage", "faviconUrl", "brandImage", "popupImage"];
    if (!allowed.includes(field))
      return res.status(400).json({ success: false, message: "Invalid field" });

    let settings = await SiteSettings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: "Settings not found" });

    // Delete file from disk
    if (settings[field]) deleteFile(settings[field]);

    settings[field] = null;
    await settings.save();

    res.json({ success: true, field, message: `${field} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── DELETE SLIDE IMAGE (admin) ─── */
export const deleteSlideImage = async (req, res) => {
  try {
    const idx = parseInt(req.body.slideIndex ?? 0, 10);
    let settings = await SiteSettings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: "Not found" });

    const oldImg = settings.heroSlides[idx]?.image;
    if (oldImg) deleteFile(oldImg);

    if (settings.heroSlides[idx]) settings.heroSlides[idx].image = "";
    // Sync heroImages
    settings.heroImages = settings.heroSlides.map((s) => s.image).filter(Boolean);
    settings.markModified("heroSlides");
    await settings.save();

    res.json({ success: true, heroSlides: settings.heroSlides, heroImages: settings.heroImages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADD REVIEW by USER (authenticated user, not admin) ─── */
export const userAddReview = async (req, res) => {
  try {
    const { productName, rating, comment, city } = req.body;
    if (!comment?.trim())
      return res.status(400).json({ success: false, message: "Comment zaroori hai" });

    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    settings.reviews.push({
      name:     req.user.name,
      city:     city || req.user.city || "Pakistan",
      rating:   Number(rating) || 5,
      comment:  comment.trim(),
      isActive: false, // pending admin approval
    });
    await settings.save();

    res.status(201).json({
      success: true,
      message: "Review submit ho gayi! Admin approval ke baad show hogi.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { name, city, rating, comment } = req.body;
    if (!name || !comment) return res.status(400).json({ success: false, message: "Name and comment required" });

    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    settings.reviews.push({ name, city: city || "Pakistan", rating: Number(rating) || 5, comment });
    await settings.save();

    res.status(201).json({ success: true, reviews: settings.reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── UPDATE REVIEW (admin) ─── */
export const updateReview = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: "Not found" });
    const review = settings.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    Object.assign(review, req.body);
    await settings.save();
    res.json({ success: true, reviews: settings.reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── DELETE REVIEW (admin) ─── */
export const deleteReview = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: "Not found" });
    settings.reviews = settings.reviews.filter((r) => r._id.toString() !== req.params.reviewId);
    await settings.save();
    res.json({ success: true, reviews: settings.reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
