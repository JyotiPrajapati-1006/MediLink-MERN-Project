// routes/shopRoutes.js

import express from "express";

// Import controller functions (to be created)
import {
  getAllShops,
  getShopById,
  createMyShop,
  getMyShopDashboard,
  updateMyShop,
  getMyShopOrders,
  updateOrderStatus,
  getMyShopPrescriptions,
  updatePrescriptionStatus,
  getMyShopDashboardData,
  getAvailableDeliveryStaff,
  getShopReports,
} from "../controllers/shopController.js";
import upload from "../middleware/uploadMiddleware.js";

// Import middleware
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Public Routes ---
// Anyone can search for and view approved shops
router.route("/").get(getAllShops);

// --- Protected Routes for Shop Owners ---
// All routes below require the user to be a logged-in shop owner
router.use(protect, restrictTo("shop-owner"));

// Create a new shop profile (for a new shop-owner user)
router
  .route("/")
  .post(
    protect,
    restrictTo("shop-owner"),
    upload.array("images", 5),
    createMyShop
  );

// Get dashboard data or update the logged-in user's own shop
router.route("/my-shop").get(getMyShopDashboard).patch(
  protect,
  restrictTo("shop-owner"),
  upload.array("images", 5),
  updateMyShop
);
router.route("/my-shop/dashboard").get(getMyShopDashboardData);
router.route("/my-shop/reports").get(getShopReports);
router
  .route("/my-shop/delivery-staff")
  .get(protect, restrictTo("shop-owner"), getAvailableDeliveryStaff);
// Manage orders for their shop
router.route("/my-shop/orders").get(getMyShopOrders);
router.route("/my-shop/orders/:orderId/status").patch(updateOrderStatus);

// Manage prescriptions related to their orders
router.route("/my-shop/prescriptions").get(getMyShopPrescriptions);
router
  .route("/my-shop/prescriptions/:prescriptionId/status")
  .patch(updatePrescriptionStatus);

router.route("/:id").get(getShopById);

export default router;
