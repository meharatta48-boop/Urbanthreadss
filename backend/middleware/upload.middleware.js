import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "ecommerce_uploads";
    let resource_type = "image";
    if (file.mimetype.startsWith("video/")) {
      resource_type = "video";
    }
    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif", "jfif", "mp4", "webm", "ogg"],
    };
  },
});

// Default product-image upload (admin panel)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

// Review media upload
export const reviewUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
});

// Product admin upload
export const productUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB per file
});

export default upload;
