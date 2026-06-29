import { body } from "express-validator";

export const signupValidation = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),

  // Email optional hai — sirf tab validate ho jab diya gaya ho
  body("email")
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage("Valid email address dalein")
    .normalizeEmail(),

  // Phone optional hai — sirf tab validate ho jab diya gaya ho
  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^(\+92|0)[0-9]{9,10}$/)
    .withMessage("Valid Pakistan phone number dalein (03001234567)"),

  // Email ya phone — ek zaroori hai
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error("Email ya phone number — ek dena zaroori hai");
    }
    return true;
  }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  // Email optional — sirf tab validate ho jab diya gaya ho
  body("email")
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage("Valid email address dalein")
    .normalizeEmail(),

  // Phone optional — sirf tab validate ho jab diya gaya ho
  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^(\+92|0)[0-9]{9,10}$/)
    .withMessage("Valid Pakistan phone number dalein (03001234567)"),

  // Email ya phone — ek zaroori hai
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error("Email ya phone — login ke liye ek zaroori hai");
    }
    return true;
  }),

  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
];

export const resetPasswordValidation = [
  body("token").isString().isLength({ min: 32 }).withMessage("Valid reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
