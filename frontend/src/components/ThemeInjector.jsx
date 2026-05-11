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
      // Colors
      themeGold          = "#d4af37",
      themeGoldLight     = "#f5d76e",
      themeGoldDark      = "#aa7c11",
      themeBgDeep        = "#fcfcfc",
      themeBgSurface     = "#f3f4f6",
      themeBgCard        = "#ffffff",
      themeBgElevated    = "#fafafa",
      themeBorder        = "#e5e7eb",
      themeBorderLight   = "#d1d5db",
      themeTextPrimary   = "#111827",
      themeTextSecondary = "#4b5563",
      themeTextMuted     = "#9ca3af",
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
        --gold: ${themeGold};
        --gold-light: ${themeGoldLight};
        --gold-dark: ${themeGoldDark};

        /* ── Admin-set backgrounds (light theme base) ── */
        --bg-deep:     ${themeBgDeep || "#ffffff"};
        --bg-surface:  ${themeBgSurface || "#f8f9fa"};
        --bg-card:     ${themeBgCard || "#ffffff"};
        --bg-elevated: ${themeBgElevated || "#fcfcfc"};

        /* ── Admin-set borders ── */
        --border:       ${themeBorder || "#efeff1"};
        --border-light: ${themeBorderLight || "#e2e4e8"};

        /* ── Admin-set text (Force dark for light theme) ── */
        --text-primary:   ${themeTextPrimary === "#ffffff" ? "#0f1115" : (themeTextPrimary || "#0f1115")};
        --text-secondary: ${themeTextSecondary === "#a1a1aa" ? "#42464d" : (themeTextSecondary || "#42464d")};
        --text-muted:     ${themeTextMuted === "#52525b" ? "#71767b" : (themeTextMuted || "#71767b")};

        /* ── Glass (derived from admin bg) ── */
        --glass-bg:     ${themeBgCard}cc;
        --glass-border: ${themeGold}26;

        /* ── Misc ── */
        --radius: ${themeRadius}px;
        --shadow: ${themeShadow};
        --announcement-bg: ${announcementBg};
        --announcement-color: ${announcementColor};

        /* ── Navbar ── */
        --nav-bg-scrolled:     ${themeBgDeep}f5;
        --nav-border:          ${themeBorder};
        --nav-text:            ${themeTextPrimary};
        --nav-text-muted:      ${themeTextSecondary};
        --nav-item-hover:      ${themeBgSurface};
        --nav-dropdown-bg:     ${themeBgCard};
        --nav-dropdown-border: ${themeBorder};
        --drawer-bg:           ${themeBgCard};
        --drawer-border:       ${themeBorder};

        /* ── Scrollbar ── */
        --scrollbar-track: ${themeBgSurface};
        --scrollbar-thumb: ${themeBorderLight};

        /* ── Typography ── */
        --font-size-base:  ${fontSizeBase}px;
        --font-size-h1:    ${fontSizeH1}px;
        --font-size-h2:    ${fontSizeH2}px;
        --font-size-h3:    ${fontSizeH3}px;
        --font-size-small: ${fontSizeSmall}px;
        --line-height:     ${lineHeight};
        --letter-spacing:  ${letterSpacing}em;

        /* ── Images ── */
        --product-ratio: ${productCardRatio};
        --hero-height:   ${heroHeight};
        --brand-ratio:   ${brandImageRatio};
        --img-fit:       ${productImgFit};

        /* ── Icons ── */
        --social-icon-size: ${socialIconSize}px;
        --nav-icon-size:    ${navIconSize}px;
      }

      /* ══════════════════════════════════
         DARK THEME — html.dark
         NOTE: Gold/accent colors inherit from :root (admin-set)
         Only bg/text/border override for dark mode
      ══════════════════════════════════ */
      html.dark {
        --bg-deep:     #050505;
        --bg-surface:  #0a0a0a;
        --bg-card:     #111111;
        --bg-elevated: #161616;

        --border:       #1f1f1f;
        --border-light: #2d2d2d;

        --text-primary:   #ffffff;
        --text-secondary: #a1a1aa;
        --text-muted:     #52525b;

        --glass-bg:     rgba(10,10,10,0.85);
        --glass-border: rgba(212,175,55,0.15);

        --scrollbar-track: #050505;
        --scrollbar-thumb: #2d2d2d;

        --nav-bg-scrolled:     rgba(5,5,5,0.96);
        --nav-border:          #1f1f1f;
        --nav-text:            #ffffff;
        --nav-text-muted:      #a1a1aa;
        --nav-item-hover:      #161616;
        --nav-dropdown-bg:     #0a0a0a;
        --nav-dropdown-border: #1f1f1f;
        --drawer-bg:           #0a0a0a;
        --drawer-border:       #111111;
      }

      /* ── Base ── */
      body {
        background-color: var(--bg-deep);
        color: var(--text-primary);
        font-family: '${themeFontBody}', system-ui, sans-serif;
        font-size: var(--font-size-base);
        line-height: var(--line-height);
        letter-spacing: var(--letter-spacing);
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
