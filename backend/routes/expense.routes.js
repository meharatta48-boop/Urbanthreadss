import express from "express";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../controllers/expense.controller.js";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin Only
router.get("/", protect, adminOnly, getExpenses);
router.post("/", protect, adminOnly, createExpense);
router.put("/:id", protect, adminOnly, updateExpense);
router.delete("/:id", protect, adminOnly, deleteExpense);

export default router;
