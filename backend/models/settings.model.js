import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema({
  image:    { type: String, default: "" },
  label:    { type: String, default: "New Season 2026" },
  title:    { type: String, default: "Style That\nSpeaks Louder" },
  subtitle: { type: String, default: "Premium Pakistani streetwear for the bold." },
  cta:      { type: String, default: "Shop Collection" },
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  city:      { type: String, default: "Pakistan" },
  rating:    { type: Number, default: 5, min: 1, max: 5 },
  comment:   { type: String, required: true },
  avatar:    { type: String, default: "" },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const siteSettingsSchema = new mongoose.Schema(
  {
    // ── Hero Slides ──
    heroSlides: {
      type: [heroSlideSchema],
      default: [
        { image: "", label: "New Season 2026", title: "Style That\nSpeaks Louder", subtitle: "Premium Pakistani streetwear.", cta: "Shop Collection" },
        { image: "", label: "Summer 2026",     title: "Urban\nVibes",             subtitle: "Ghar par baithe best fashion.",  cta: "Shop Summer" },
        { image: "", label: "New Arrivals",    title: "Trend\nSetter",            subtitle: "Jo pehnein wo trend ban jaye.", cta: "View New Arrivals" },
      ],
    },

    // ── Legacy hero ──
    heroImages:   { type: [String], default: [] },
    heroLabel:    { type: String, default: "New Season 2026" },
    heroTitle:    { type: String, default: "Style That\nSpeaks Louder" },
    heroSubtitle: { type: String, default: "Premium Pakistani streetwear." },
    heroCta:      { type: String, default: "Shop Collection" },

    // ── Brand Story ──
    brandTitle: { type: String, default: "Fashion Born From Pakistani Streets" },
    brandText1: { type: String, default: "Urban Thread was born from a simple vision — to bring world-class streetwear to the streets of Pakistan." },
    brandText2: { type: String, default: "From Karachi ki garmi to Lahore ki shaam, our fabrics are designed to move with you." },
    brandYear:  { type: String, default: "2020" },
    brandImage: { type: String, default: "" },

    // ── Business Info ──
    phone:    { type: String, default: "+92 300 1234567" },
    email:    { type: String, default: "info@urbanthread.pk" },
    address:  { type: String, default: "Lahore, Pakistan" },
    whatsapp: { type: String, default: "923003765389" },

    // ── Shop Settings ──
    deliveryCharges: { type: Number, default: 250 },
    couponCode:      { type: String, default: "" },
    couponDiscount:  { type: Number, default: 500 },
    brandName:       { type: String, default: "URBAN THREAD" },
    footerTagline:   { type: String, default: "Pakistan ka premium streetwear brand." },

    // ── Social ──
    instagram: { type: String, default: "#" },
    facebook:  { type: String, default: "#" },
    youtube:   { type: String, default: "#" },
    tiktok:    { type: String, default: "#" },

    // ── Logo ──
    logoImage:         { type: String, default: "" },
    logoMobileImage:   { type: String, default: "" },
    navLogoSize:       { type: String, default: "48" },
    navLogoMobileSize: { type: String, default: "40" },
    footerLogoSize:    { type: String, default: "60" },
    showBrandName:     { type: Boolean, default: true },
    navTitleSize:      { type: String, default: "20" },

    // ── Site Meta (favicon + tab title) ──
    siteTitle:  { type: String, default: "URBAN THREAD" },
    faviconUrl: { type: String, default: "" },  // path to uploaded favicon

    // ── Customer Reviews ──
    reviews: { type: [reviewSchema], default: [] },

    // ═══════════════════════════════════════════════
    // THEME / DESIGN TOKENS
    // ═══════════════════════════════════════════════
    themeGold:          { type: String, default: "#c9a84c" },
    themeGoldLight:     { type: String, default: "#e8c96a" },
    themeGoldDark:      { type: String, default: "#8a6a1a" },
    // ── LIGHT theme defaults (matching index.css :root) ──
    themeBgDeep:        { type: String, default: "#f7f5f0" },
    themeBgSurface:     { type: String, default: "#f0ece3" },
    themeBgCard:        { type: String, default: "#ffffff" },
    themeBgElevated:    { type: String, default: "#f5f1ea" },
    themeBorder:        { type: String, default: "#e2ddd4" },
    themeBorderLight:   { type: String, default: "#d4cfc6" },
    themeTextPrimary:   { type: String, default: "#1a1410" },
    themeTextSecondary: { type: String, default: "#6b6560" },
    themeTextMuted:     { type: String, default: "#9e9891" },
    themeFontDisplay:   { type: String, default: "Playfair Display" },
    themeFontBody:      { type: String, default: "Inter" },
    themeRadius:        { type: String, default: "12" },
    themeShadow:        { type: String, default: "luxury" },

    // ── Typography Sizes (rem) ──
    fontSizeBase:    { type: String, default: "16" },   // body px
    fontSizeH1:      { type: String, default: "48" },   // hero heading
    fontSizeH2:      { type: String, default: "36" },   // section heading
    fontSizeH3:      { type: String, default: "22" },   // card title
    fontSizeSmall:   { type: String, default: "13" },   // labels
    lineHeight:      { type: String, default: "1.65" },
    letterSpacing:   { type: String, default: "0" },

    // ── Image Sizes ──
    productCardRatio:  { type: String, default: "3/4" },   // product card aspect ratio
    heroHeight:        { type: String, default: "100svh" }, // hero section height
    brandImageRatio:   { type: String, default: "4/5" },   // brand story image
    productImgFit:     { type: String, default: "cover" },  // cover|contain

    // ── Icon Set ──
    iconStyle:     { type: String, default: "outline" }, // outline|solid|rounded
    navIcons:      { type: Boolean, default: true },
    footerIcons:   { type: Boolean, default: true },
    productIcons:  { type: Boolean, default: true },
    socialIconSize:{ type: String, default: "20" },
    navIconSize:   { type: String, default: "20" },

    // ── Section Visibility ──
    showHero:       { type: Boolean, default: true },
    showStats:      { type: Boolean, default: true },
    showFeatured:   { type: Boolean, default: true },
    showBrandStory: { type: Boolean, default: true },
    showReviews:    { type: Boolean, default: true },
    showNewsletter: { type: Boolean, default: true },

    // ── Section Text Content ──
    statsTitle:      { type: String, default: "Pakistan Ke Bharose Ka Nishaana" },
    statsSubLabel:   { type: String, default: "By The Numbers" },
    featuredTitle:   { type: String, default: "Featured Collection" },
    featuredLabel:   { type: String, default: "Curated Picks" },
    reviewsTitle:    { type: String, default: "What Our Customers Say" },
    reviewsLabel:    { type: String, default: "Real Reviews" },
    newsletterTitle: { type: String, default: "Get Exclusive Deals First" },
    newsletterLabel: { type: String, default: "Newsletter" },
    newsletterDesc:  { type: String, default: "Subscribe karo aur pehle pao — new drops, flash sales." },

    // ── Announcement Bar ──
    announcementText:  { type: String, default: "" },
    announcementBg:    { type: String, default: "#c9a84c" },
    announcementColor: { type: String, default: "#000000" },

    // ── Support Page ──
    supportTitle:    { type: String, default: "Hum Yahan Hain" },
    supportSubtitle: { type: String, default: "Koi bhi sawaal ho — hum 24/7 available hain." },
    supportHours:    { type: String, default: "Mon–Sat: 9am – 9pm" },

    // ── Custom CSS & Scripts ──
    customCSS: { type: String, default: "" },
    customScripts: { type: String, default: "" },

    // ── Advanced / Pro Controls ──
    maintenanceMode: { type: Boolean, default: false },
    isComingSoon: { type: Boolean, default: false },
    launchDate: { type: Date, default: null },
    currencySymbol: { type: String, default: "Rs." },
    currencyPosition: { type: String, default: "left" }, // left | right

    // ── SEO & Meta ──
    defaultMetaDesc: { type: String, default: "Premium streetwear from Pakistan." },
    metaKeywords: { type: String, default: "streetwear, fashion, pakistan, urban thread" },
    seoLocale: { type: String, default: "en_PK" },
    seoGeoRegion: { type: String, default: "PK-PB" },
    seoGeoPlacename: { type: String, default: "Lahore" },
    seoGeoPosition: { type: String, default: "31.5204;74.3587" },
    seoRobots: { type: String, default: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
    seoTwitterHandle: { type: String, default: "" },
    seoDefaultImage: { type: String, default: "" },
    seoBrandTagline: { type: String, default: "Pakistan ka premium streetwear brand." },

    // ── Floating Action Buttons ──
    whatsappFloatEnabled: { type: Boolean, default: true },

    // ── Promotional Popup ──
    popupEnabled: { type: Boolean, default: false },
    popupImage: { type: String, default: "" },
    popupTitle: { type: String, default: "Special Offer!" },
    popupText: { type: String, default: "Get 20% off on your first order. Use code: WELCOME20" },
    popupCtaText: { type: String, default: "Shop Now" },
    popupCtaLink: { type: String, default: "/shop" },

    // ── Invoice Settings ──
    invoiceShowLogo:    { type: Boolean, default: true },
    invoiceShowAddress: { type: Boolean, default: true },
    invoiceShowPhone:   { type: Boolean, default: true },
    invoiceShowEmail:   { type: Boolean, default: true },
    invoiceTagline:     { type: String, default: "Official Invoice / Receipt" },
    invoiceThankYou:    { type: String, default: "Shukriya hamse khareedne ka!" },
    invoiceFooterNote:  { type: String, default: "Yeh computer-generated invoice hai — koi signature zaroorat nahi" },
    invoiceNote:        { type: String, default: "" },

    // ── Footer Settings ──
    footerCopyright:  { type: String, default: "© 2026 Urban Thread. All rights reserved." },
    footerShowSocial: { type: Boolean, default: true },
    footerColumns: {
      type: [{
        heading: { type: String, default: "Links" },
        links: [{
          label: { type: String },
          url:   { type: String },
        }],
      }],
      default: [
        { heading: "Quick Links", links: [{ label: "Shop", url: "/shop" }, { label: "About", url: "/about" }, { label: "Support", url: "/support" }] },
        { heading: "Help", links: [{ label: "Track Order", url: "/my-orders" }, { label: "Returns", url: "/support" }, { label: "Contact", url: "/support" }] },
      ],
    },

    // ── Section Order & Visibility ──
    sectionOrder: {
      type: [{
        id:        { type: String },
        label:     { type: String },
        isVisible: { type: Boolean, default: true },
      }],
      default: [
        { id: "hero",     label: "Hero Banner",        isVisible: true },
        { id: "stats",    label: "Stats Bar",           isVisible: true },
        { id: "featured", label: "Featured Products",   isVisible: true },
        { id: "brand",    label: "Brand Story",         isVisible: true },
        { id: "reviews",  label: "Customer Reviews",    isVisible: true },
        { id: "newsletter",label: "Newsletter",         isVisible: true },
      ],
    },


  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
export default SiteSettings;
