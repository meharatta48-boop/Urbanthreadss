import express from "express";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import upload from "../middleware/upload.middleware.js";

import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory.controller.js";

const router = express.Router();

router.get("/", getSubCategories);
router.post("/", protect, adminOnly, upload.single("image"), createSubCategory);
router.put("/:id", protect, adminOnly, upload.single("image"), updateSubCategory);
router.delete("/:id", protect, adminOnly, deleteSubCategory);

export default router;
