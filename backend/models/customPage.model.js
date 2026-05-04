import mongoose from "mongoose";

const customPageSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  content:   { type: String, default: "" },
  metaDesc:  { type: String, default: "" },
  isVisible: { type: Boolean, default: true },
  showInNav: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate slug from title if not provided
customPageSchema.pre("validate", function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  next();
});

const CustomPage = mongoose.model("CustomPage", customPageSchema);
export default CustomPage;
