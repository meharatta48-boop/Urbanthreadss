import { SERVER_URL } from "../services/api";

/**
 * Builds optimized image URLs with Cloudinary auto-enhancement
 * Automatically compresses, resizes, and optimizes images
 * @param {string} imagePath - The image path from the API
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.height - Target height in pixels
 * @param {number} options.quality - Quality 1-100 (default: 80)
 * @param {string} options.format - Image format (auto, webp, jpg, etc.)
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imagePath, options = {}) => {
  if (!imagePath) return "";

  // If it's already an absolute URL (http/https), return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Build the base URL
  let url = `${SERVER_URL}${imagePath}`;

  // For Cloudinary URLs, add optimization parameters
  if (imagePath.includes("/upload/")) {
    const quality = options.quality || 80;
    const format = options.format || "auto";
    const width = options.width ? `,w_${options.width}` : "";
    const height = options.height ? `,h_${options.height}` : "";
    const fit = options.fit || "fill";

    // Insert transformation parameters before /upload/
    url = imagePath.replace(
      /\/upload\//,
      `/upload/q_${quality},f_${format},c_${fit}${width}${height}/`
    );

    if (!url.startsWith("http")) {
      url = `${SERVER_URL}${url}`;
    }
  }

  return url;
};

/**
 * Get responsive image srcSet for picture element
 * @param {string} imagePath - The image path
 * @param {number} maxWidth - Maximum width for srcset
 * @returns {string} - srcSet string
 */
export const getResponsiveImageSrcSet = (imagePath, maxWidth = 1200) => {
  if (!imagePath) return "";

  const sizes = [320, 640, 960, 1280];
  const srcSet = sizes
    .filter(size => size <= maxWidth)
    .map(size => `${getOptimizedImageUrl(imagePath, { width: size, quality: 80 })} ${size}w`)
    .join(", ");

  return srcSet;
};

/**
 * Get thumbnail-optimized image URL (for product grids)
 * @param {string} imagePath - The image path
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (imagePath) => {
  return getOptimizedImageUrl(imagePath, {
    width: 400,
    height: 500,
    quality: 75,
    fit: "crop"
  });
};

/**
 * Get product detail image URL (larger, higher quality)
 * @param {string} imagePath - The image path
 * @returns {string} - Optimized product image URL
 */
export const getProductImageUrl = (imagePath) => {
  return getOptimizedImageUrl(imagePath, {
    width: 800,
    height: 1000,
    quality: 85,
    fit: "crop"
  });
};

/**
 * Get cart/checkout image URL (small thumbnail)
 * @param {string} imagePath - The image path
 * @returns {string} - Cart image URL
 */
export const getCartImageUrl = (imagePath) => {
  return getOptimizedImageUrl(imagePath, {
    width: 200,
    height: 200,
    quality: 70,
    fit: "crop"
  });
};

/**
 * Preload image (returns a promise)
 * @param {string} src - Image URL
 * @returns {Promise}
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 * @param {string[]} sources - Array of image URLs
 * @returns {Promise}
 */
export const preloadImages = (sources) => {
  return Promise.all(sources.map(src => preloadImage(src)));
};
