import Expense from "../models/expense.model.js";

// Helper function to create activity logs
const logAdminAction = async (req, action, details) => {
  try {
    if (req.user) {
      const ActivityLog = (await import("../models/activityLog.model.js")).default;
      await ActivityLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action,
        details,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      });
    }
  } catch (err) {
    console.error("Activity logging failed:", err);
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch expenses" });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    
    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || "misc",
      date: date ? new Date(date) : new Date(),
      notes,
    });

    await logAdminAction(req, "CREATE_EXPENSE", `Created expense "${title}" of Rs. ${amount}`);

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create expense" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;

    await expense.save();
    await logAdminAction(req, "UPDATE_EXPENSE", `Updated expense "${expense.title}"`);

    res.status(200).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update expense" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    await logAdminAction(req, "DELETE_EXPENSE", `Deleted expense "${expense.title}"`);
    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete expense" });
  }
};
