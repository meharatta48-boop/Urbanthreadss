import { body, param, query } from "express-validator";

export const productPaginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be 1-100"),
];

export const productIdParamValidation = [
  param("id").isMongoId().withMessage("Invalid product id"),
];

export const createProductValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("price").isFloat({ min: 0 }).withMessage("price must be >= 0"),
  body("category").isMongoId().withMessage("category must be a valid id"),
];
