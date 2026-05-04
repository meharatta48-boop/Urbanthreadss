import SubCategory from "../models/subCategory.model.js";
import Category from "../models/category.model.js";
import fs from "fs";
import path from "path";

// GET ALL
export const getSubCategories = async (req, res, next) => {
  try {
    const subCategories = await SubCategory.find({ isActive: true })
      .populate("category", "name")
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: subCategories });
  } catch (error) {
    next(error);
  }
};

// CREATE
export const createSubCategory = async (req, res, next) => {
  try {
    const { name, category } = req.body;
    if (!name?.trim() || !category) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Name and category required" });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    // Case-insensitive duplicate check within same category
    const exists = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      category,
      isActive: true,
    });
    if (exists) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(409).json({ success: false, message: `"${name}" already exists in this category` });
    }

    const imageUrl = req.file ? req.file.path : null;
    const subCategory = await SubCategory.create({ name: name.trim(), category, image: imageUrl });

    // Return populated
    const populated = await SubCategory.findById(subCategory._id).populate("category", "name");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

// UPDATE
export const updateSubCategory = async (req, res, next) => {
  try {
    const { name, category, removeImage } = req.body;
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: "SubCategory not found" });
    }

    if (name) subCategory.name = name.trim();
    if (category) subCategory.category = category;

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (subCategory.image) {
        const oldPath = path.join(path.resolve(), subCategory.image);
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }
      subCategory.image = req.file.path;
    } else if (removeImage === "true") {
      if (subCategory.image) {
        const oldPath = path.join(path.resolve(), subCategory.image);
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }
      subCategory.image = null;
    }

    await subCategory.save();
    const populated = await SubCategory.findById(subCategory._id).populate("category", "name");
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

// DELETE (hard delete)
export const deleteSubCategory = async (req, res, next) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory)
      return res.status(404).json({ success: false, message: "SubCategory not found" });

    // Delete image file if exists
    if (subCategory.image) {
      const imgPath = path.join(path.resolve(), subCategory.image);
      if (fs.existsSync(imgPath)) fs.unlink(imgPath, () => {});
    }

    await subCategory.deleteOne();
    res.status(200).json({ success: true, message: "SubCategory deleted" });
  } catch (error) {
    next(error);
  }
};
