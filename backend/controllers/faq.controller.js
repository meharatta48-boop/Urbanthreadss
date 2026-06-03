import FAQ from "../models/faq.model.js";

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

export const getFAQs = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch FAQs" });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive, order } = req.body;
    
    const faq = await FAQ.create({
      question,
      answer,
      category: category || "General",
      isActive: isActive !== false,
      order: Number(order) || 0,
    });

    await logAdminAction(req, "CREATE_FAQ", `Created FAQ "${question}"`);

    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create FAQ" });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive, order } = req.body;
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (isActive !== undefined) faq.isActive = isActive;
    if (order !== undefined) faq.order = Number(order) || 0;

    await faq.save();
    await logAdminAction(req, "UPDATE_FAQ", `Updated FAQ "${faq.question}"`);

    res.status(200).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update FAQ" });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    await logAdminAction(req, "DELETE_FAQ", `Deleted FAQ "${faq.question}"`);
    res.status(200).json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete FAQ" });
  }
};
