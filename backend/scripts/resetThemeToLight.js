/**
 * Fix Script: Reset dark theme settings to light theme in MongoDB
 * Run: node scripts/resetThemeToLight.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const LIGHT_THEME = {
  themeBgDeep:        "#f7f5f0",
  themeBgSurface:     "#f0ece3",
  themeBgCard:        "#ffffff",
  themeBgElevated:    "#f5f1ea",
  themeBorder:        "#e2ddd4",
  themeBorderLight:   "#d4cfc6",
  themeTextPrimary:   "#1a1410",
  themeTextSecondary: "#6b6560",
  themeTextMuted:     "#9e9891",
  themeGold:          "#c9a84c",
  themeGoldLight:     "#e8c96a",
  themeGoldDark:      "#8a6a1a",
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const result = await db.collection("sitesettings").updateMany(
      {},
      { $set: LIGHT_THEME }
    );

    console.log(`✅ Updated ${result.modifiedCount} settings document(s) to LIGHT theme`);
    console.log("🎨 Theme colors reset:", LIGHT_THEME);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  }
}

run();
