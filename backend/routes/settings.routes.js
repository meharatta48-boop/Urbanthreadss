import express from "express";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import upload from "../middleware/upload.middleware.js";

import {
  getSettings, updateSettings,
  uploadSlideImage, uploadHeroImages, deleteHeroImage,
  uploadBrandImage, uploadLogo,
  deleteSettingImage, deleteSlideImage,
  addReview, updateReview, deleteReview,
  userAddReview,
} from "../controllers/settings.controller.js";
import validateRequest from "../middleware/validate.middleware.js";
import {
  reviewIdParamValidation,
  updateSettingsValidation,
} from "../validators/settings.validators.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getSettings);

/* USER (any logged-in user) — submit review */
router.post("/user-review", protect, userAddReview);

/* ADMIN — TEXT + SLIDES */
router.put("/", protect, adminOnly, updateSettingsValidation, validateRequest, updateSettings);

/* ADMIN — HERO SLIDE IMAGE */
router.post("/slide-image",  protect, adminOnly, upload.single("image"), uploadSlideImage);

/* ADMIN — HERO BULK */
router.post("/hero-images",  protect, adminOnly, upload.array("images", 5), uploadHeroImages);
router.delete("/hero-images",protect, adminOnly, deleteHeroImage);

/* ADMIN — OTHER IMAGES */
router.post("/brand-image",  protect, adminOnly, upload.single("image"), uploadBrandImage);
router.post("/logo",         protect, adminOnly, upload.single("image"), uploadLogo);
router.post("/favicon",      protect, adminOnly, upload.single("image"), uploadLogo);

/* ADMIN — DELETE INDIVIDUAL IMAGES (POST to avoid DELETE body issues) */
router.post("/delete-image",       protect, adminOnly, deleteSettingImage);
router.post("/delete-slide-image", protect, adminOnly, deleteSlideImage);
/* Also keep DELETE variants for backward compat */
router.delete("/image",       protect, adminOnly, deleteSettingImage);
router.delete("/slide-image", protect, adminOnly, deleteSlideImage);

/* ADMIN — REVIEWS CRUD */
router.post("/reviews",             protect, adminOnly, addReview);
router.put("/reviews/:reviewId",    protect, adminOnly, reviewIdParamValidation, validateRequest, updateReview);
router.delete("/reviews/:reviewId", protect, adminOnly, reviewIdParamValidation, validateRequest, deleteReview);

export default router;

