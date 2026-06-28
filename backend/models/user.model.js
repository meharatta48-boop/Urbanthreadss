import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,   // null/undefined values unique constraint se bahar hain
      default: null,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: null,
      unique: true,
      sparse: true,   // null values unique constraint se bahar hain
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    storeCredit: {
      type: Number,
      default: 0,
    },
    customerSegment: {
      type: String,
      enum: ["new", "regular", "vip"],
      default: "new",
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorBackupCodes: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
