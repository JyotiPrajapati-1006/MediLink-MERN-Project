import express from "express";
import {
  getShopCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  verifyCoupon,
  getCouponsByShopId,
  getAllActiveCoupons,
} from "../controllers/couponController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public route to verify coupon at checkout
router.post("/verify", verifyCoupon);

// Public route to fetch coupons for a shop
router.get("/shop/:shopId", getCouponsByShopId);

// Public route to fetch all global active coupons
router.get("/global/active", getAllActiveCoupons);

// Protected routes for shop owners
router.use(protect, restrictTo("shop-owner"));

router.route("/")
  .get(getShopCoupons)
  .post(upload.single("image"), createCoupon);

router.route("/:id")
  .patch(upload.single("image"), updateCoupon)
  .delete(deleteCoupon);

export default router;
