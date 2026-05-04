import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getAllUsers,
} from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import {
  forgotPasswordValidation,
  loginValidation,
  resetPasswordValidation,
  signupValidation,
} from "../validators/auth.validators.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", signupValidation, validateRequest, signup);
// POST /api/auth/login
router.post("/login", loginValidation, validateRequest, login);
// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPasswordValidation, validateRequest, forgotPassword);
// POST /api/auth/reset-password
router.post("/reset-password", resetPasswordValidation, validateRequest, resetPassword);
// GET /api/auth/users  — admin only
router.get("/users", protect, adminOnly, getAllUsers);

export default router;
