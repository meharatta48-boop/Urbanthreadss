import express from "express";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import upload, { reviewUpload, productUpload } from "../middleware/upload.middleware.js";

import {
  getProducts, getProductById,
  createProduct, updateProduct,
  deleteProduct, deleteProductImage,
  addProductReview, deleteProductReview,
} from "../controllers/product.controller.js";
import validateRequest from "../middleware/validate.middleware.js";
import {
  createProductValidation,
  productIdParamValidation,
  productPaginationValidation,
} from "../validators/product.validators.js";

const router = express.Router();

/* PUBLIC */
router.get("/", productPaginationValidation, validateRequest, getProducts);
router.get("/:id", productIdParamValidation, validateRequest, getProductById);

/* USER — Reviews (multipart: reviewImages[] + reviewVideo) */
router.post(
  "/:id/reviews",
  protect,
  reviewUpload.fields([
    { name: "reviewImages", maxCount: 4 },
    { name: "reviewVideo",  maxCount: 1 },
  ]),
  addProductReview
);
router.delete("/:id/reviews/:reviewId", protect, deleteProductReview);

/* ADMIN ONLY */
const productFields = productUpload.fields([
  { name: "images",       maxCount: 8 },
  { name: "productVideo", maxCount: 1 },
]);
router.post("/",    protect, adminOnly, productFields, createProductValidation, validateRequest, createProduct);
router.put("/:id",  protect, adminOnly, productIdParamValidation, productFields, validateRequest, updateProduct);
router.delete("/:id/image", protect, adminOnly, productIdParamValidation, validateRequest, deleteProductImage);
router.delete("/:id",       protect, adminOnly, productIdParamValidation, validateRequest, deleteProduct);

export default router;

