import { body, param } from "express-validator";

export const updateSettingsValidation = [
  body("deliveryCharges")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("deliveryCharges must be >= 0"),
  body("couponDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("couponDiscount must be >= 0"),
  body("email").optional().isEmail().withMessage("email must be valid"),
];

export const reviewIdParamValidation = [
  param("reviewId").isMongoId().withMessage("Invalid review id"),
];
