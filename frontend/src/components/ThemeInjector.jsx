import { useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";

const GOOGLE_FONTS = [
  "Inter","Roboto","Poppins","Outfit","Lato","Open Sans",
  "Montserrat","Nunito","Raleway","DM Sans","Josefin Sans",
  "Playfair Display","Cormorant Garamond","EB Garamond",
  "Libre Baskerville","Merriweather","Lora","Cinzel",
];

import { SERVER_URL } from "../services/api";
import { resolveMediaUrl } from "../utils/mediaUrl";
const API_BASE = SERVER_URL;

export default function ThemeInjector() {
  const { settings } = useSettings();
  const lastFaviconHref = useRef(""); // track what's currently injected

  useEffect(() => {
    if (!settings) return;

    const {
      // Colors - WHITE THEME PRIORITY
      themeGold          = "#c9a84c",
      themeGoldLight     = "#e5cf8e",
      themeGoldDark      = "#a68b39",
      themeBgDeep        = "#ffffff",
      themeBgSurface     = "#fafafa",
      themeBgCard        = "#ffffff",
      themeBgElevated    = "#ffffff",
      themeBorder        = "#f0f0f0",
      themeBorderLight   = "#e8e8e8",
      themeTextPrimary   = "#000000",
      themeTextSecondary = "#333333",
      themeTextMuted     = "#666666",
      themeFontDisplay   = "Playfair Display",
      themeFontBody      = "Inter",
      themeRadius        = "12",
      themeShadow        = "luxury",
      // Typography
      fontSizeBase   = "16",
      fontSizeH1     = "48",
      fontSizeH2     = "36",
      fontSizeH3     = "22",
      fontSizeSmall  = "13",
      lineHeight     = "1.65",
      letterSpacing  = "0",
      // Image
      productCardRatio = "3/4",
      heroHeight       = "100svh",
      brandImageRatio  = "4/5",
      productImgFit    = "cover",
      // Icons
      socialIconSize = "20",
      navIconSize    = "20",
      // Announcement
      announcementBg    = "#c9a84c",
      announcementColor = "#000000",
      // Meta
      siteTitle  = "URBAN THREAD",
      faviconUrl = "",
      brandName  = "URBAN THREAD",
      // Custom
      customCSS = "",
    } = settings;

    // ── 1. Document Title & SEO ──
    document.title = siteTitle || brandName || "URBAN THREAD";
    
    // Inject Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = settings.defaultMetaDesc || "Premium streetwear from Pakistan.";

    // Inject Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = settings.metaKeywords || "streetwear, fashion, pakistan, urban thread";

    // ── 2. Favicon (only update if href actually changed) ──
    const faviconHref = faviconUrl
      ? resolveMediaUrl(faviconUrl, API_BASE)
      : "./public/logo.png";

    if (lastFaviconHref.current !== faviconHref) {
      lastFaviconHref.current = faviconHref;
      // Remove ALL existing favicon links
      document
        .querySelectorAll("link[rel='icon'], link[rel='shortcut icon']")
        .forEach((el) => el.parentNode.removeChild(el));

      // Inject fresh favicon — use timestamp only for custom uploads to bust cache
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.type = "image/png";
      newFavicon.href = faviconUrl
        ? faviconHref + "?t=" + Date.now()  // cache-bust only custom favicon
        : faviconHref;                        // static /logo.png — no timestamp needed
      document.head.appendChild(newFavicon);
    }

    const css = `
      :root {
        /* ── Brand Colors ── */
        --gold: ${themeGold} !important;
        --gold-light: ${themeGoldLight} !important;
        --gold-dark: ${themeGoldDark} !important;

        /* ── WHITE THEME ENFORCEMENT (Override all admin settings) ── */
        --bg-deep:     #ffffff !important;
        --bg-surface:  #fafafa !important;
        --bg-card:     #ffffff !important;
        --bg-elevated: #ffffff !important;

        /* ── WHITE THEME BORDERS ── */
        --border:       #f0f0f0 !important;
        --border-light: #e8e8e8 !important;

        /* ── WHITE THEME TEXT (Maximum contrast) ── */
        --text-primary:   #000000 !important;
        --text-secondary: #333333 !important;
        --text-muted:     #666666 !important;

        /* ── Glass (White theme) ── */
        --glass-bg:     rgba(255, 255, 255, 0.95) !important;
        --glass-border: rgba(201, 168, 76, 0.15) !important;

        /* ── Misc ── */
        --radius: ${themeRadius}px !important;
        --shadow: ${themeShadow} !important;
        --announcement-bg: ${announcementBg} !important;
        --announcement-color: ${announcementColor} !important;

        /* ── Navbar (White theme) ── */
        --nav-bg-scrolled:     rgba(255, 255, 255, 0.98) !important;
        --nav-border:          #f0f0f0 !important;
        --nav-text:            #000000 !important;
        --nav-text-muted:      #666666 !important;
        --nav-item-hover:      #f8f8f8 !important;
        --nav-dropdown-bg:     #ffffff !important;
        --nav-dropdown-border: #f0f0f0 !important;
        --drawer-bg:           #ffffff !important;
        --drawer-border:       #f0f0f0 !important;

        /* ── Scrollbar (White theme) ── */
        --scrollbar-track: #f8f8f8 !important;
        --scrollbar-thumb: #d0d0d0 !important;

        /* ── Typography ── */
        --font-size-base:  ${fontSizeBase}px !important;
        --font-size-h1:    ${fontSizeH1}px !important;
        --font-size-h2:    ${fontSizeH2}px !important;
        --font-size-h3:    ${fontSizeH3}px !important;
        --font-size-small: ${fontSizeSmall}px !important;
        --line-height:     ${lineHeight} !important;
        --letter-spacing:  ${letterSpacing}em !important;

        /* ── Images ── */
        --product-ratio: ${productCardRatio} !important;
        --hero-height:   ${heroHeight} !important;
        --brand-ratio:   ${brandImageRatio} !important;
        --img-fit:       ${productImgFit} !important;

        /* ── Icons ── */
        --social-icon-size: ${socialIconSize}px !important;
        --nav-icon-size:    ${navIconSize}px !important;
      }

      /* ══════════════════════════════════
         DISABLE DARK THEME - FORCE WHITE THEME
         White theme is enforced across all conditions
      ══════════════════════════════════ */
      html.dark {
        /* Override dark theme with white theme */
        --bg-deep:     #ffffff !important;
        --bg-surface:  #fafafa !important;
        --bg-card:     #ffffff !important;
        --bg-elevated: #ffffff !important;

        --border:       #f0f0f0 !important;
        --border-light: #e8e8e8 !important;

        --text-primary:   #000000 !important;
        --text-secondary: #333333 !important;
        --text-muted:     #666666 !important;

        --glass-bg:     rgba(255, 255, 255, 0.95) !important;
        --glass-border: rgba(201, 168, 76, 0.15) !important;

        --scrollbar-track: #f8f8f8 !important;
        --scrollbar-thumb: #d0d0d0 !important;

        --nav-bg-scrolled:     rgba(255, 255, 255, 0.98) !important;
        --nav-border:          #f0f0f0 !important;
        --nav-text:            #000000 !important;
        --nav-text-muted:      #666666 !important;
        --nav-item-hover:      #f8f8f8 !important;
        --nav-dropdown-bg:     #ffffff !important;
        --nav-dropdown-border: #f0f0f0 !important;
        --drawer-bg:           #ffffff !important;
        --drawer-border:       #f0f0f0 !important;
      }

      /* ── Base (White theme enforced) ── */
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
        font-family: '${themeFontBody}', system-ui, sans-serif !important;
        font-size: var(--font-size-base) !important;
        line-height: var(--line-height) !important;
        letter-spacing: var(--letter-spacing) !important;
        overflow-x: hidden !important;
      }

      /* ── Font classes ── */
      .font-display { font-family: '${themeFontDisplay}', serif !important; }

      /* ── Gold tokens ── */
      .gold-text {
        background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-dark) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .gold-gradient {
        background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 60%, var(--gold-dark) 100%);
      }

      /* ── Buttons ── */
      .btn-gold {
        background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 60%, var(--gold-dark) 100%);
        color: #000;
        border-radius: var(--radius);
        font-size: var(--font-size-base);
      }
      .btn-outline {
        border-radius: var(--radius) !important;
      }

      /* ── Inputs & cards ── */
      .lux-input, .lux-select {
        border-radius: var(--radius) !important;
        font-size: var(--font-size-base) !important;
      }
      .product-card {
        border-radius: var(--radius) !important;
      }
      html.dark .product-card {
      }

      /* ── Product card images ── */
      .product-card .aspect-\\[3\\/4\\] {
        aspect-ratio: ${productCardRatio.replace("/", " / ")} !important;
      }
      .product-card img {
        object-fit: ${productImgFit} !important;
      }

      /* ── Hero height ── */
      section[data-hero="true"] {
        height: ${heroHeight} !important;
        min-height: 520px;
      }

      /* ── Section headings ── */
      h1.font-display, .section-h1 { font-size: clamp(calc(${fontSizeH1}px * 0.55), 7vw, ${fontSizeH1}px) !important; }
      h2.font-display, .section-h2 { font-size: clamp(calc(${fontSizeH2}px * 0.65), 5vw, ${fontSizeH2}px) !important; }
      h3.font-display, .section-h3 { font-size: ${fontSizeH3}px !important; }
      .section-label              { font-size: var(--font-size-small) !important; }

      /* ── Custom CSS ── */
      ${customCSS || ""}
    `;

    let el = document.getElementById("ut-theme-injector");
    if (!el) {
      el = document.createElement("style");
      el.id = "ut-theme-injector";
      document.head.appendChild(el);
    }
    el.textContent = css;

    // Body bg immediate — only set if settings have custom colors
    // (CSS variables from index.css handle the theme switching)
    document.body.style.backgroundColor = "";

    // Load Google Fonts
    const fontsToLoad = [themeFontDisplay, themeFontBody].filter((f) => GOOGLE_FONTS.includes(f));
    if (fontsToLoad.length) {
      const fontId = "ut-google-fonts";
      let linkEl = document.getElementById(fontId);
      if (!linkEl) {
        linkEl = document.createElement("link");
        linkEl.id = fontId;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
      }
      const q = fontsToLoad.map((f) => `family=${f.replace(/ /g, "+")}:ital,wght@0,300;0,400;0,600;0,700;1,400`).join("&");
      linkEl.href = `https://fonts.googleapis.com/css2?${q}&display=swap`;
    }

    // Phase 0 hardening: disable execution of arbitrary custom scripts.
    const scriptContainer = document.getElementById("ut-custom-scripts");
    if (scriptContainer) {
      scriptContainer.innerHTML = "";
      scriptContainer.remove();
    }
  }, [settings]);

  return null;
}
