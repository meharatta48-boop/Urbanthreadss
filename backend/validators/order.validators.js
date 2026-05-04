import { body, param, query } from "express-validator";

export const createOrderValidation = [
  body("orderItems").isArray({ min: 1 }).withMessage("orderItems are required"),
  body("orderItems.*.product").isMongoId().withMessage("Invalid product id"),
  body("orderItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Item quantity must be at least 1"),
  body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("shippingAddress.address").trim().notEmpty().withMessage("Address is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
];

export const orderIdParamValidation = [
  param("id").isMongoId().withMessage("Invalid order id"),
];

export const orderPaginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be 1-100"),
];

export const updateOrderStatusValidation = [
  ...orderIdParamValidation,
  body("status")
    .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
];
