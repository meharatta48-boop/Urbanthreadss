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
  "privacyPolicyContent",
  "termsOfServiceContent",
  "returnPolicyContent",
  "shippingInfoContent",
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

  if (rest.automationTemplates && typeof rest.automationTemplates === "string") {
    try {
      rest.automationTemplates = JSON.parse(rest.automationTemplates);
    } catch {}
  }

  for (const field of RICH_TEXT_FIELDS) {
    if (typeof rest[field] === "string") {
      rest[field] = sanitizeRichText(rest[field]);
    }
  }

  return rest;
};
