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
        { image: "", label: "Summer 2026",     title: "Urban\nVibes",             subtitle: "Shop the best fashion from home.",  cta: "Shop Summer" },
        { image: "", label: "New Arrivals",    title: "Trend\nSetter",            subtitle: "Wear what becomes the next trend.", cta: "View New Arrivals" },
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
    brandText2: { type: String, default: "From the summer heat of Karachi to the evenings of Lahore, our fabrics are designed to move with you." },
    brandYear:  { type: String, default: "2020" },
    brandImage: { type: String, default: "" },

    // ── About Us Page ──
    aboutUsHeroTitle: { type: String, default: "Our Story" },
    aboutUsHeroSubtitle: { type: String, default: "Redefining Streetwear in Pakistan" },
    aboutUsHeroImage: { type: String, default: "" },
    aboutUsStoryTitle: { type: String, default: "How It All Started" },
    aboutUsStoryText1: { type: String, default: "Urban Thread started with a simple idea: premium streetwear shouldn't be a luxury imported from abroad." },
    aboutUsStoryText2: { type: String, default: "We wanted to create something that represents the raw, unfiltered energy of our streets, combining global trends with local culture." },
    aboutUsStoryImage: { type: String, default: "" },
    aboutUsStats1Value: { type: String, default: "50k+" },
    aboutUsStats1Label: { type: String, default: "Happy Customers" },
    aboutUsStats2Value: { type: String, default: "100%" },
    aboutUsStats2Label: { type: String, default: "Made in Pakistan" },
    aboutUsFoundersTitle: { type: String, default: "Behind The Thread" },
    aboutUsFoundersSubtitle: { type: String, default: "Meet the duo driving the creative engine of Urban Thread." },
    aboutUsMissionTitle: { type: String, default: "Our Mission" },
    aboutUsMissionText: { type: String, default: "To empower the youth with clothing that speaks louder than words. Quality fabrics, bold designs, and zero compromises." },
    aboutUsMissionImage: { type: String, default: "" },
    aboutUsMissionBullet1: { type: String, default: "Uncompromising Quality" },
    aboutUsMissionBullet2: { type: String, default: "Authentic Expression" },
    aboutUsMissionBullet3: { type: String, default: "Community Driven" },
    aboutUsMissionBadgeTop: { type: String, default: "Quality Guaranteed" },
    aboutUsMissionBadgeBottom: { type: String, default: "100% Cotton" },
    aboutUsContactTitle: { type: String, default: "Get In Touch" },
    aboutUsContactSubtitle: { type: String, default: "Have questions? We'd love to hear from you." },
    aboutUsCtaTitle: { type: String, default: "Ready to define your style?" },
    aboutUsCtaButton: { type: String, default: "Shop the Collection" },

    // ── Founders ──
    founder1Name:  { type: String, default: "" },
    founder1Role:  { type: String, default: "Co-Founder" },
    founder1Bio:   { type: String, default: "" },
    founder1Image: { type: String, default: "" },
    founder1Insta: { type: String, default: "#" },
    founder2Name:  { type: String, default: "" },
    founder2Role:  { type: String, default: "Co-Founder" },
    founder2Bio:   { type: String, default: "" },
    founder2Image: { type: String, default: "" },
    founder2Insta: { type: String, default: "#" },

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
    footerTagline:   { type: String, default: "Pakistan's premium streetwear brand." },

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
    themeGold:          { type: String, default: "#d4af37" },
    themeGoldLight:     { type: String, default: "#f5d76e" },
    themeGoldDark:      { type: String, default: "#aa7c11" },
    // ── LIGHT theme defaults (matching index.css :root) ──
    themeBgDeep:        { type: String, default: "#fcfcfc" },
    themeBgSurface:     { type: String, default: "#f3f4f6" },
    themeBgCard:        { type: String, default: "#ffffff" },
    themeBgElevated:    { type: String, default: "#fafafa" },
    themeBorder:        { type: String, default: "#e5e7eb" },
    themeBorderLight:   { type: String, default: "#d1d5db" },
    themeTextPrimary:   { type: String, default: "#111827" },
    themeTextSecondary: { type: String, default: "#4b5563" },
    themeTextMuted:     { type: String, default: "#9ca3af" },
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
    statsTitle:      { type: String, default: "Trusted Across Pakistan" },
    statsSubLabel:   { type: String, default: "By The Numbers" },
    featuredTitle:   { type: String, default: "Featured Collection" },
    featuredLabel:   { type: String, default: "Curated Picks" },
    reviewsTitle:    { type: String, default: "What Our Customers Say" },
    reviewsLabel:    { type: String, default: "Real Reviews" },
    newsletterTitle: { type: String, default: "Get Exclusive Deals First" },
    newsletterLabel: { type: String, default: "Newsletter" },
    newsletterDesc:  { type: String, default: "Subscribe now to get early access to new drops and flash sales." },

    // ── Announcement Bar ──
    announcementText:  { type: String, default: "" },
    announcementBg:    { type: String, default: "#c9a84c" },
    announcementColor: { type: String, default: "#000000" },

    // ── Support Page ──
    supportTitle:    { type: String, default: "We Are Here" },
    supportSubtitle: { type: String, default: "Have questions? We are available 24/7 to help." },
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
    seoBrandTagline: { type: String, default: "Pakistan's premium streetwear brand." },

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
    invoiceThankYou:    { type: String, default: "Thank you for shopping with us!" },
    invoiceFooterNote:  { type: String, default: "This is a computer-generated invoice — no signature is required" },
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

    // ── Automation & Notification Templates ──
    automationTemplates: {
      type: {
        email: {
          type: [{
            id: { type: String },
            name: { type: String },
            desc: { type: String },
            isActive: { type: Boolean, default: true },
            subject: { type: String, default: "" },
          }],
          default: [
            { id: "welcome", name: "Welcome Sequence", desc: "Sent immediately after user registration.", isActive: true, subject: "Welcome to Urban Threads Family! 🎉" },
            { id: "cart_recovery", name: "Abandoned Cart Alert", desc: "Sent 2 hours after shopper leaves items in cart.", isActive: true, subject: "Don't forget your streetwear drip! 🛍️" },
            { id: "order_confirmation", name: "Order Receipt Notification", desc: "Sent instantly on order placement.", isActive: true, subject: "Order Confirmed - ID #{{orderId}}" },
          ],
        },
        whatsapp: {
          type: [{
            id: { type: String },
            name: { type: String },
            body: { type: String },
            isActive: { type: Boolean, default: true },
          }],
          default: [
            { id: "cod_confirm", name: "COD Order Verification", body: "Assalam-o-Alaikum {{name}}, Aap ka Urban Threads order received ho gaya hai. Total billing Rs. {{total}} hai. Kia aap delivery confirm karte hain?", isActive: true },
            { id: "shipped_alert", name: "Courier Shipped Alert", body: "Hello {{name}}, Aap ka streetwear block par dispatch ho gaya hai! Leopard tracking link: {{trackingLink}}", isActive: true },
          ],
        },
        sms: {
          type: [{
            id: { type: String },
            name: { type: String },
            body: { type: String },
            isActive: { type: Boolean, default: true },
          }],
          default: [
            { id: "sms_ship", name: "Courier dispatch text", body: "Urban Threads: Order #{{id}} has been shipped via Leopard. Track here: {{link}}", isActive: true },
          ],
        },
        push: {
          type: {
            title: { type: String, default: "New Drop Live!" },
            body: { type: String, default: "Shop the latest Pakistani streetwear drop now before stock sells out!" },
            isEnabled: { type: Boolean, default: true },
          },
          default: {
            title: "New Drop Live!",
            body: "Shop the latest Pakistani streetwear drop now before stock sells out!",
            isEnabled: true,
          },
        },
      },
      default: {},
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

    // ── Privacy Policy Settings ──
    privacyPolicyTitle: { type: String, default: "Privacy Policy" },
    privacyPolicyContent: {
      type: String,
      default: "<h2>1. Information We Collect</h2><p>At Urban Thread, we collect your name, email, phone number, and physical shipping address when you place a Cash on Delivery (COD) order. This information is required to process and ship your streetwear products securely across Pakistan.</p><h2>2. How We Use Your Data</h2><p>We use your delivery details solely to deliver your orders through our courier partners and to send tracking updates via SMS or email. We do not sell, rent, or share your private information with third-party advertisers.</p><h2>3. Secure Payments</h2><p>Since we primarily offer Cash on Delivery (COD) inside Pakistan, your payment transaction is processed safely in person. For any online prepaid transactions, we use encrypted and secure gateways to safeguard your details.</p><h2>4. Cookies & Analytics</h2><p>Our website uses browser cookies to remember your shopping cart items and analyze site traffic to offer a premium shopping experience.</p>"
    },
    privacyPolicyMetaTitle: { type: String, default: "Privacy Policy | Urban Thread Streetwear" },
    privacyPolicyMetaDesc: { type: String, default: "Read the Privacy Policy of Urban Thread. Learn how we secure your order details and protect your personal information in Pakistan." },
    privacyPolicyEnabled: { type: Boolean, default: true },

    // ── Terms of Service Settings ──
    termsOfServiceTitle: { type: String, default: "Terms of Service" },
    termsOfServiceContent: {
      type: String,
      default: "<h2>1. Introduction</h2><p>Welcome to Urban Thread! By accessing our website or purchasing our products, you agree to follow these Terms of Service. These terms apply to all visitors, buyers, and administrators of the site.</p><h2>2. Cash on Delivery (COD) and Orders</h2><p>All streetwear orders placed are subject to stock availability and price confirmation. When you place a Cash on Delivery (COD) order, please ensure you are available to receive the package and provide exact change to the delivery agent.</p><h2>3. Accurate Delivery Details</h2><p>To avoid delivery delays across Pakistan, please provide a complete address, including house number, street name, sector/area, and city, along with an active phone number.</p><h2>4. Intellectual Property</h2><p>All designs, photos, graphics, and logos on this website are the intellectual property of Urban Thread. You are not allowed to copy or reuse them for commercial purposes without our written permission.</p>"
    },
    termsOfServiceMetaTitle: { type: String, default: "Terms of Service | Urban Thread Streetwear" },
    termsOfServiceMetaDesc: { type: String, default: "Understand the Terms of Service for using the Urban Thread online store. Guidelines for Cash on Delivery, ordering rules, and user agreements in Pakistan." },
    termsOfServiceEnabled: { type: Boolean, default: true },

    // ── Return Policy Settings ──
    returnPolicyTitle: { type: String, default: "Return & Exchange Policy" },
    returnPolicyContent: {
      type: String,
      default: "<h2>1. 7-Day Easy Returns</h2><p>We want you to love your streetwear! If a product doesn't fit or meet your expectations, you can return or exchange it within 7 days of delivery. No difficult legal procedures required.</p><h2>2. Eligibility for Returns</h2><p>To be eligible for an exchange or return, your apparel must be unworn, unwashed, and in the exact same condition that you received it. Hang tags and original packaging must be intact.</p><h2>3. How to Initiate a Return</h2><p>Simply send a message to our WhatsApp Support (+92 300 1234567) or open a Support Ticket on our website. Please share your Order ID and photos of the item. Our friendly team will guide you through the process.</p><h2>4. Delivery Charges</h2><p>The customer is responsible for shipping the item back to our Lahore warehouse. In case we sent a wrong or damaged item, Urban Thread will cover the return delivery costs.</p>"
    },
    returnPolicyMetaTitle: { type: String, default: "Return & Exchange Policy | Urban Thread Streetwear" },
    returnPolicyMetaDesc: { type: String, default: "Read our simple 7-day return and exchange policy. Easily return or exchange your unworn streetwear via WhatsApp support or support ticket." },
    returnPolicyEnabled: { type: Boolean, default: true },

    // ── Shipping Info Settings ──
    shippingInfoTitle: { type: String, default: "Shipping Information" },
    shippingInfoContent: {
      type: String,
      default: "<h2>1. Nationwide Delivery</h2><p>We deliver premium streetwear to Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, Multan, and all other cities and towns across Pakistan.</p><h2>2. Cash on Delivery (COD)</h2><p>To give you peace of mind, we offer Cash on Delivery (COD). You only pay when the parcel is delivered to your doorstep by our courier partner.</p><h2>3. Shipping Charges</h2><p>We charge a flat rate of Rs. 250 for delivery nationwide. <strong>Good news!</strong> We offer free shipping on all orders above Rs. 2000.</p><h2>4. Delivery Times</h2><p>Orders inside Lahore typically take 2 to 3 business days. Deliveries to other major cities like Karachi and Islamabad take 3 to 5 business days. Remote areas may take up to 6 business days.</p><h2>5. Order Tracking</h2><p>Once your streetwear drop is shipped, you will receive a tracking link via SMS or email so you can check your parcel's location in real-time.</p>"
    },
    shippingInfoMetaTitle: { type: String, default: "Shipping Information & Delivery Times | Urban Thread" },
    shippingInfoMetaDesc: { type: String, default: "Get details about Cash on Delivery (COD), shipping charges, and delivery times for Lahore, Karachi, Islamabad, and all other cities in Pakistan." },
    shippingInfoEnabled: { type: Boolean, default: true },


  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
export default SiteSettings;
