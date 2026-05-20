import mongoose from "mongoose";

const businessGoalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Achieve 500,000 PKR profit within 6 months",
      trim: true
    },
    targetProfit: {
      type: Number,
      default: 500000,
      min: 0
    },
    durationMonths: {
      type: Number,
      default: 6,
      min: 1
    },
    startDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const BusinessGoal = mongoose.model("BusinessGoal", businessGoalSchema);
export default BusinessGoal;
