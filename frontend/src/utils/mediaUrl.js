const ABSOLUTE_URL_RE = /^https?:\/\//i;

const trimSlash = (value = "") => value.replace(/\/+$/, "");

const normalizeServerBase = (serverUrl = "") => {
  const cleaned = trimSlash((serverUrl || "").trim());
  if (!cleaned) return "";
  return cleaned.replace(/\/api$/i, "");
};

const normalizePath = (raw = "") => raw.replace(/\\/g, "/").trim();
const collapsePathSlashes = (value = "") => value.replace(/\/{2,}/g, "/");

export const resolveMediaUrl = (rawPath, serverUrl) => {
  if (typeof rawPath !== "string") return null;
  const value = normalizePath(rawPath);
  if (!value) return null;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (ABSOLUTE_URL_RE.test(value)) return value;

  const base = normalizeServerBase(serverUrl);
  const uploadsIndex = value.toLowerCase().lastIndexOf("/uploads/");
  let relativePath = value;

  if (uploadsIndex >= 0) relativePath = value.slice(uploadsIndex);
  else if (value.toLowerCase().startsWith("uploads/")) relativePath = `/${value}`;
  else if (!value.startsWith("/")) relativePath = `/${value}`;
  relativePath = collapsePathSlashes(relativePath);

  return base ? `${base}${relativePath}` : relativePath;
};
