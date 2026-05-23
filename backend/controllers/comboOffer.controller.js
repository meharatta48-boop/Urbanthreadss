import ComboOffer from "../models/comboOffer.model.js";
import fs from "fs";
import path from "path";

const deleteFile = (filePath) => {
  if (!filePath) return;
  const full = path.join(path.resolve(), filePath.replace(/^\//, ""));
  if (fs.existsSync(full)) fs.unlinkSync(full);
};

const parseProducts = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
};

/* ─── GET ACTIVE COMBOS (PUBLIC) ─── */
export const getComboOffers = async (req, res, next) => {
  try {
    const query = { isActive: true };
    const combos = await ComboOffer.find(query)
      .populate({
        path: "products.product",
        select: "name description price comparePrice images colors sizes stock isActive",
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: combos });
  } catch (error) {
    next(error);
  }
};

/* ─── GET ALL COMBOS (ADMIN) ─── */
export const getAllComboOffersAdmin = async (req, res, next) => {
  try {
    const combos = await ComboOffer.find()
      .populate({
        path: "products.product",
        select: "name description price comparePrice images colors sizes stock isActive",
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: combos });
  } catch (error) {
    next(error);
  }
};

/* ─── GET SINGLE COMBO BY ID (PUBLIC/ADMIN) ─── */
export const getComboOfferById = async (req, res, next) => {
  try {
    const combo = await ComboOffer.findById(req.params.id)
      .populate({
        path: "products.product",
        select: "name description price comparePrice images colors sizes stock isActive",
      })
      .lean();

    if (!combo) {
      return res.status(404).json({ success: false, message: "Combo offer not found" });
    }

    res.status(200).json({ success: true, data: combo });
  } catch (error) {
    next(error);
  }
};

/* ─── CREATE COMBO OFFER (ADMIN ONLY) ─── */
export const createComboOffer = async (req, res, next) => {
  try {
    const { name, price, comparePrice, description, isActive, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Name and price are required" });
    }

    // req.files is an object containing images (from productUpload or upload middleware)
    const imageFiles = req.files?.images || req.files || [];
    const images = Array.isArray(imageFiles) ? imageFiles.map((f) => f.path) : [];

    const products = parseProducts(req.body.products);

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Combo must contain at least one product" });
    }

    const combo = await ComboOffer.create({
      name: name.trim(),
      description: description || "",
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : 0,
      images,
      products,
      isActive: isActive !== "false" && isActive !== false,
      stock: stock !== undefined ? Number(stock) : 99,
    });

    const populated = await ComboOffer.findById(combo._id).populate("products.product");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/* ─── UPDATE COMBO OFFER (ADMIN ONLY) ─── */
export const updateComboOffer = async (req, res, next) => {
  try {
    const combo = await ComboOffer.findById(req.params.id);
    if (!combo) {
      return res.status(404).json({ success: false, message: "Combo offer not found" });
    }

    const { name, price, comparePrice, description, isActive, stock, keepImages } = req.body;

    // Handle images to keep and delete removed images
    let imagesToKeep = [];
    if (keepImages) {
      try {
        imagesToKeep = JSON.parse(keepImages);
      } catch {
        imagesToKeep = [];
      }
    } else {
      imagesToKeep = combo.images;
    }

    // Delete removed images from Cloudinary or local disk
    combo.images.forEach((img) => {
      if (!imagesToKeep.includes(img)) {
        deleteFile(img);
      }
    });

    // Handle new uploaded images
    const imageFiles = req.files?.images || req.files || [];
    const newImages = Array.isArray(imageFiles) ? imageFiles.map((f) => f.path) : [];
    combo.images = [...imagesToKeep, ...newImages];

    combo.name = name?.trim() ?? combo.name;
    combo.description = description ?? combo.description;
    combo.price = price !== undefined ? Number(price) : combo.price;
    combo.comparePrice = comparePrice !== undefined ? Number(comparePrice) : combo.comparePrice;
    
    if (req.body.products !== undefined) {
      combo.products = parseProducts(req.body.products);
    }
    
    if (isActive !== undefined) {
      combo.isActive = isActive === "true" || isActive === true;
    }
    
    if (stock !== undefined) {
      combo.stock = Number(stock);
    }

    await combo.save();

    const populated = await ComboOffer.findById(combo._id).populate("products.product");

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

/* ─── DELETE COMBO OFFER (ADMIN ONLY) ─── */
export const deleteComboOffer = async (req, res, next) => {
  try {
    const combo = await ComboOffer.findById(req.params.id);
    if (!combo) {
      return res.status(404).json({ success: false, message: "Combo offer not found" });
    }

    // Delete images
    combo.images.forEach((img) => deleteFile(img));
    await combo.deleteOne();

    res.status(200).json({ success: true, message: "Combo offer deleted successfully" });
  } catch (error) {
    next(error);
  }
};
