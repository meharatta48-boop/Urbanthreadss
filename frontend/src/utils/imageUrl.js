import { SERVER_URL } from "../services/api";

/**
 * Builds the correct image URL, handling both relative paths and absolute URLs
 * @param {string} imagePath - The image path from the API (can be relative or absolute URL)
 * @returns {string} - The correct full URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  
  // If it's already an absolute URL (http/https), return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  return `${SERVER_URL}${imagePath}`;
};
