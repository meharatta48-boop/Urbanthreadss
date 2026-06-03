import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  updateUserLoyalty,
  updateUserCredit,
  updateUserSegment,
  updateUserPhone,
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
// PUT /api/auth/users/:userId/role — admin only
router.put("/users/:userId/role", protect, adminOnly, updateUserRole);
// PUT /api/auth/users/:userId/status — admin only
router.put("/users/:userId/status", protect, adminOnly, toggleUserStatus);
// PUT /api/auth/users/:userId/loyalty — admin only
router.put("/users/:userId/loyalty", protect, adminOnly, updateUserLoyalty);
// PUT /api/auth/users/:userId/credit — admin only
router.put("/users/:userId/credit", protect, adminOnly, updateUserCredit);
// PUT /api/auth/users/:userId/segment — admin only
router.put("/users/:userId/segment", protect, adminOnly, updateUserSegment);
// PUT /api/auth/users/:userId/phone — admin only
router.put("/users/:userId/phone", protect, adminOnly, updateUserPhone);
// DELETE /api/auth/users/:userId — admin only
router.delete("/users/:userId", protect, adminOnly, deleteUser);

export default router;
