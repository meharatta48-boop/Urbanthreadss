import express from "express";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import { productUpload } from "../middleware/upload.middleware.js";
import {
  getComboOffers,
  getAllComboOffersAdmin,
  getComboOfferById,
  createComboOffer,
  updateComboOffer,
  deleteComboOffer,
} from "../controllers/comboOffer.controller.js";

const router = express.Router();

/* ADMIN ONLY — must be declared BEFORE /:id to avoid route collision */
const comboFields = productUpload.fields([
  { name: "images", maxCount: 8 }
]);

router.get("/admin/all", protect, adminOnly, getAllComboOffersAdmin);
router.post("/", protect, adminOnly, comboFields, createComboOffer);
router.put("/:id", protect, adminOnly, comboFields, updateComboOffer);
router.delete("/:id", protect, adminOnly, deleteComboOffer);

/* PUBLIC — /:id wildcard must come LAST */
router.get("/", getComboOffers);
router.get("/:id", getComboOfferById);

export default router;
