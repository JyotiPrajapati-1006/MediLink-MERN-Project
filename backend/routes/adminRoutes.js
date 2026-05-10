// routes/adminRoutes.js

import express from "express";

// Import controller functions (assuming they will be created)
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPendingShops,
  approveShop,
  rejectShop,
  getAllComplaints,
  resolveComplaint,
  getDashboardStats,
  getAllOrders,
  getAllShops,
  getAllReviewsAndComplaints,
  updateReviewOrComplaint,
  deleteReviewOrComplaint,
  clearShopPayout,
  clearDeliveryPayout,
  getPayoutsData,
  getAdminReports,
} from "../controllers/adminController.js";
import upload from "../middleware/uploadMiddleware.js";

// Import category controller functions
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

// Import middleware
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protect and restrictTo middleware to all routes in this file
router.use(protect);
router.use(restrictTo("admin"));

// --- Main Dashboard & Reports ---
router.route("/stats").get(getDashboardStats);
router.route("/reports").get(getAdminReports);

router.route("/payouts").get(getPayoutsData);
router.route("/payouts/shop/:shopId/clear").patch(clearShopPayout);
router.route("/payouts/delivery/:staffId/clear").patch(clearDeliveryPayout);

// --- User Management Routes ---
router.route("/users").get(getAllUsers);

router.route("/orders").get(getAllOrders);

router
  .route("/users/:id")
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

// --- Shop Management Routes ---
router.route("/shops").get(getAllShops);
router.route("/shops/pending").get(getPendingShops);
router.route("/shops/:id/approve").patch(approveShop);
router.route("/shops/:id/reject").patch(rejectShop);

// --- Category & Subcategory Management Routes ---
router.route("/categories").post(upload.single("image"), createCategory);
router
  .route("/categories/:id")
  .patch(upload.single("image"), updateCategory)
  .delete(deleteCategory);

router.route("/reviews").get(getAllReviewsAndComplaints);

router
  .route("/reviews/:id")
  .patch(updateReviewOrComplaint)
  .delete(deleteReviewOrComplaint);

export default router;
