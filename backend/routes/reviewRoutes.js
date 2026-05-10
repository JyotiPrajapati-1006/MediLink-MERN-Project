// backend/routes/reviewRoutes.js
import express from "express";
import {
  createShopReview,
  getReviewsForShop,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to get reviews for a shop
router.get("/shop/:shopId", getReviewsForShop);

// Protected route for customers to create a review
router.post(
  "/shop/:orderId",
  protect,
  restrictTo("customer"),
  createShopReview
);

export default router;
