import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true },
    size:     { type: String, default: "" },
    color:    { type: String, default: "" },
    image:    { type: String, default: "" },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName:   { type: String, required: true },
    phone:      { type: String, default: "" },
    address:    { type: String, required: true },
    city:       { type: String, required: true },
    province:   { type: String, default: "" },
    postalCode: { type: String, default: "00000" },
    country:    { type: String, default: "Pakistan" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = guest
    guestInfo: {
      name:  { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    orderItems:      [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    itemsPrice:      { type: Number, required: true },
    shippingPrice:   { type: Number, default: 250 },
    couponCode:      { type: String, default: "" },
    couponDiscount:  { type: Number, default: 0 },
    totalPrice:      { type: Number, required: true },
    paymentMethod:   { type: String, enum: ["COD", "Card", "EasyPaisa", "JazzCash"], default: "COD" },
    paymentStatus:   { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus:     {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paidAt:       { type: Date },
    deliveredAt:  { type: Date },
    note:         { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "shippingAddress.phone": 1 });
orderSchema.index({ "guestInfo.email": 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
