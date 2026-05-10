// backend/controllers/reviewController.js
import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

export const createShopReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  // Find the order to get the shop ID
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new Error("Order not found.");
  if (order.user.toString() !== req.user.id) throw new Error("Not authorized.");

  const newReview = await Review.create({
    reviewType: "Review",
    user: req.user.id,
    shop: order.shop,
    order: req.params.orderId,
    rating,
    comment,
  });
  res.status(201).json({ success: true, data: newReview });
});

export const getReviewsForShop = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    shop: req.params.shopId,
    reviewType: "Review",
  }).populate("user", "name");
  res.status(200).json({ success: true, data: reviews });
});
