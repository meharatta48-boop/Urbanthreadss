import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images:  { type: [String], default: [] },   // up to 4 review photos
    video:   { type: String, default: "" },      // optional review video
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    description:  { type: String, default: "" },
    price:        { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    category:     { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory:  { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    images:       { type: [String], default: [] },
    video:        { type: String, default: "" },  // optional product video
    stock:        { type: Number, default: 0 },
    sizes:        [{ type: String }],
    colors:       [{ type: String }],
    tags:         [{ type: String }],
    isFeatured:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    reviews:      [productReviewSchema],
    rating:       { type: Number, default: 0 },
    numReviews:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, isActive: 1, createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
