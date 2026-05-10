import mongoose from "mongoose";
import dotenv from "dotenv";
import CustomPage from "./models/customPage.model.js";
import NavLink from "./models/navLink.model.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Create Pages
    const pages = [
      {
        title: "About Us",
        slug: "about-us",
        content: "<h2>About URBAN THREADS</h2><p>Welcome to Urban Threads, your number one source for premium streetwear in Pakistan. We're dedicated to providing you the very best of fashion, with an emphasis on quality, exclusivity, and modern aesthetics.</p><p>Founded with a passion for modern luxury apparel, Urban Threads has come a long way from its beginnings. When we first started out, our passion for premium streetwear drove us to start our own business.</p>",
      },
      {
        title: "Return & Exchange Policy",
        slug: "return-exchange-policy",
        content: "<h2>Return & Exchange Policy</h2><p>We want you to be completely satisfied with your purchase. If you are not entirely satisfied with your order, we are here to help.</p><h3>Returns</h3><p>You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p><h3>Exchanges</h3><p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, please contact our support team.</p>",
      },
      {
        title: "Shipping Policy",
        slug: "shipping-policy",
        content: "<h2>Shipping Policy</h2><p>We offer fast and reliable delivery all over Pakistan. Cash on Delivery (COD) is available for all major cities including Lahore, Karachi, Islamabad, Rawalpindi, and Faisalabad.</p><h3>Processing Time</h3><p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p><h3>Delivery Time</h3><p>Standard delivery takes 3-5 business days depending on your location.</p>",
      }
    ];

    for (const p of pages) {
      const exists = await CustomPage.findOne({ slug: p.slug });
      if (!exists) {
        await CustomPage.create(p);
        console.log(`Created page: ${p.title}`);
      } else {
        console.log(`Page already exists: ${p.title}`);
      }
    }

    // 2. Create NavLinks
    const links = [
      { label: "Home", url: "/", order: 0 },
      { label: "Shop", url: "/shop", order: 1 },
      { label: "About Us", url: "/page/about-us", order: 2 },
      { label: "Policies", url: "/page/return-exchange-policy", order: 3 },
      { label: "Contact Us", url: "/support", order: 4 },
    ];

    for (const l of links) {
      const exists = await NavLink.findOne({ label: l.label });
      if (!exists) {
        await NavLink.create(l);
        console.log(`Created NavLink: ${l.label}`);
      } else {
        console.log(`NavLink already exists: ${l.label}`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
