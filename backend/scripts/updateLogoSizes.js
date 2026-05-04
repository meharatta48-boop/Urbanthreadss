/**
 * Quick script to update logo sizes in DB
 * Run: node scripts/updateLogoSizes.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import SiteSettings from "../models/settings.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/urbanthread";

async function updateLogoSizes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          navLogoSize:       "48",
          navLogoMobileSize: "40",
          footerLogoSize:    "60",
          navTitleSize:      "20",
        },
      },
      { upsert: true, new: true }
    );

    console.log("✅ Logo sizes updated successfully!");
    console.log("   navLogoSize:      ", result.navLogoSize);
    console.log("   navLogoMobileSize:", result.navLogoMobileSize);
    console.log("   footerLogoSize:   ", result.footerLogoSize);
    console.log("   navTitleSize:     ", result.navTitleSize);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

updateLogoSizes();
