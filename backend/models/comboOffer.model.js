import mongoose from "mongoose";

const comboOfferSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    comparePrice: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        colors: [{ type: String }],
        sizes: [{ type: String }],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 99,
      min: 0,
    },
  },
  { timestamps: true }
);

comboOfferSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("ComboOffer", comboOfferSchema);
