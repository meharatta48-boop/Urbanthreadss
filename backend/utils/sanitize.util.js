import sanitizeHtml from "sanitize-html";

const richTextOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "span",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "style"],
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel", "data"],
};

export const sanitizeRichText = (value) => {
  if (typeof value !== "string") return value;
  return sanitizeHtml(value, richTextOptions);
};
