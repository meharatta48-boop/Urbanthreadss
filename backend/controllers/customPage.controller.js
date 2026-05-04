import CustomPage from "../models/customPage.model.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { sanitizeRichText } from "../utils/sanitize.util.js";

/* GET all pages (admin) */
export const getAllPages = async (req, res) => {
  try {
    const pages = await CustomPage.find().sort({ createdAt: -1 });
    return sendSuccess(res, { pages });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* GET single page by slug (public) */
export const getPageBySlug = async (req, res) => {
  try {
    const page = await CustomPage.findOne({ slug: req.params.slug, isVisible: true });
    if (!page) return sendError(res, "Page not found", 404);
    return sendSuccess(res, { page });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* CREATE page (admin) */
export const createPage = async (req, res) => {
  try {
    const { title, slug, content, metaDesc, isVisible, showInNav } = req.body;
    if (!title) return sendError(res, "Title required", 400);

    // Auto slug from title
    const autoSlug = slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check unique slug
    const exists = await CustomPage.findOne({ slug: autoSlug });
    if (exists) return sendError(res, `Slug "${autoSlug}" already exists`, 400);

    const page = await CustomPage.create({
      title,
      slug: autoSlug,
      content: sanitizeRichText(content),
      metaDesc: sanitizeRichText(metaDesc),
      isVisible,
      showInNav,
    });
    return sendSuccess(res, { page }, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* UPDATE page (admin) */
export const updatePage = async (req, res) => {
  try {
    const { title, slug, content, metaDesc, isVisible, showInNav } = req.body;

    // If slug is being changed, check it's not taken by another page
    if (slug) {
      const existing = await CustomPage.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) return sendError(res, `Slug "${slug}" already used by another page`, 400);
    }

    const page = await CustomPage.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        content: sanitizeRichText(content),
        metaDesc: sanitizeRichText(metaDesc),
        isVisible,
        showInNav,
      },
      { new: true, runValidators: true }
    );
    if (!page) return sendError(res, "Not found", 404);
    return sendSuccess(res, { page });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* DELETE page (admin) */
export const deletePage = async (req, res) => {
  try {
    await CustomPage.findByIdAndDelete(req.params.id);
    return sendSuccess(res, { message: "Page deleted" });
  } catch (err) {
    return sendError(res, err.message);
  }
};
