// routes/orderRoutes.js

import express from "express";

// Import controller functions (to be created)
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  createSplitOrder,
} from "../controllers/orderController.js";

// Import middleware
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Apply 'protect' middleware to all routes in this file
router.use(protect);
// Get all orders for the logged-in customer, or create a new one
router
  .route("/")
  .post(restrictTo("customer"), upload.single("prescription"), createOrder)
  .get(restrictTo("customer"), getMyOrders);

router.route("/create-split").post(restrictTo("customer"), createSplitOrder);

// Get a single order by its ID
// The controller will ensure the user owns this order or is an admin/shop-owner
router.route("/:id").get(getOrderById);

// Cancel an order
// The controller will check if the order is eligible for cancellation
router.patch("/:id/cancel", restrictTo("customer"), cancelMyOrder);

export default router;
