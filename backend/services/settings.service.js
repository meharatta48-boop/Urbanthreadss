import { sanitizeRichText } from "../utils/sanitize.util.js";

const RICH_TEXT_FIELDS = [
  "brandText1",
  "brandText2",
  "newsletterDesc",
  "announcementText",
  "popupText",
  "defaultMetaDesc",
  "footerTagline",
  "invoiceThankYou",
  "invoiceFooterNote",
  "invoiceNote",
];

export const prepareSettingsPatch = (payload = {}) => {
  const {
    heroImages,
    brandImage,
    logoImage,
    logoMobileImage,
    faviconUrl,
    popupImage,
    ...rest
  } = payload;

  if (rest.heroSlides && typeof rest.heroSlides === "string") {
    try {
      rest.heroSlides = JSON.parse(rest.heroSlides);
    } catch {}
  }

  if (rest.reviews && typeof rest.reviews === "string") {
    try {
      rest.reviews = JSON.parse(rest.reviews);
    } catch {}
  }

  for (const field of RICH_TEXT_FIELDS) {
    if (typeof rest[field] === "string") {
      rest[field] = sanitizeRichText(rest[field]);
    }
  }

  return rest;
};
