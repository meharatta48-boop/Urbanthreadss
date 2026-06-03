import Blog from "../models/blog.model.js";

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

export const getBlogs = async (req, res) => {
  try {
    const { isPublished } = req.query;
    const query = {};
    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true";
    }

    const blogs = await Blog.find(query).sort({ publishedAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch blog post" });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content, image, tags, isPublished, author } = req.body;
    
    // Generate clean slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const blog = await Blog.create({
      title,
      slug,
      content,
      image,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(",") : [],
      isPublished: isPublished !== false,
      author: author || "Urban Threads Admin",
    });

    await logAdminAction(req, "CREATE_BLOG", `Created blog post "${title}"`);

    res.status(201).json({ success: true, blog });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Blog title/slug must be unique" });
    }
    res.status(500).json({ success: false, message: error.message || "Failed to create blog" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { title, content, image, tags, isPublished, author } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (title) {
      blog.title = title;
      blog.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (content !== undefined) blog.content = content;
    if (image !== undefined) blog.image = image;
    if (tags !== undefined) {
      blog.tags = Array.isArray(tags) ? tags : tags ? tags.split(",") : [];
    }
    if (isPublished !== undefined) blog.isPublished = isPublished;
    if (author !== undefined) blog.author = author;

    await blog.save();
    await logAdminAction(req, "UPDATE_BLOG", `Updated blog post "${blog.title}"`);

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update blog" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await logAdminAction(req, "DELETE_BLOG", `Deleted blog post "${blog.title}"`);
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete blog" });
  }
};
