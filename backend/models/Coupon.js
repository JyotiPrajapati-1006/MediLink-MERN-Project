import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "A coupon must have a code."],
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: [true, "A coupon must have a discount percentage."],
      min: 1,
      max: 100,
    },
    shop: {
      type: mongoose.Schema.ObjectId,
      ref: "Shop",
      required: [true, "A coupon must belong to a shop."],
    },
    image: {
      type: String,
      required: [true, "A coupon must have a promotional image/banner."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: [true, "A coupon must have an expiry date."],
    },
  },
  { timestamps: true }
);

// A shop cannot have two coupons with the same code
couponSchema.index({ code: 1, shop: 1 }, { unique: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
