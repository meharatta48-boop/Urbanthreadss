import path from "path";

const ABSOLUTE_URL_RE = /^https?:\/\//i;

const normalizeSlashes = (value = "") => value.replace(/\\/g, "/").trim();
const collapsePathSlashes = (value = "") => value.replace(/\/{2,}/g, "/");

export const normalizeStoredImagePath = (input) => {
  if (typeof input !== "string") return "";
  const value = normalizeSlashes(input);
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (ABSOLUTE_URL_RE.test(value)) return value;

  const uploadsIndex = value.toLowerCase().lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) return collapsePathSlashes(value.slice(uploadsIndex));
  if (value.toLowerCase().startsWith("uploads/")) return collapsePathSlashes(`/${value}`);
  if (value.startsWith("/")) return collapsePathSlashes(value);
  return collapsePathSlashes(`/${value}`);
};

export const toAbsoluteUploadFsPath = (input, uploadsRoot) => {
  const normalized = normalizeStoredImagePath(input);
  if (!normalized.startsWith("/uploads/")) return "";
  return path.join(uploadsRoot, normalized.slice("/uploads/".length));
};
