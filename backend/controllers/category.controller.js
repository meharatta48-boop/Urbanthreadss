import Category from "../models/category.model.js";
import fs from "fs";
import path from "path";

// GET ALL
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// CREATE
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim())
      return res.status(400).json({ success: false, message: "Category name is required" });

    // Check case-insensitive
    const exists = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      isActive: true,
    });
    if (exists) {
      // Remove uploaded file if duplicate
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const imageUrl = req.file ? req.file.path : null;
    const category = await Category.create({ name: name.trim(), image: imageUrl });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

// UPDATE
export const updateCategory = async (req, res, next) => {
  try {
    const { name, removeImage } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    // Update name
    if (name?.trim()) category.name = name.trim();

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (category.image) {
        const oldPath = path.join(path.resolve(), category.image);
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }
      category.image = req.file.path;
    } else if (removeImage === "true") {
      // Delete old image
      if (category.image) {
        const oldPath = path.join(path.resolve(), category.image);
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }
      category.image = null;
    }

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

// DELETE (hard delete)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    // Delete image file if exists
    if (category.image) {
      const imgPath = path.join(path.resolve(), category.image);
      if (fs.existsSync(imgPath)) fs.unlink(imgPath, () => {});
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};
