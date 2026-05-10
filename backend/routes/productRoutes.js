// routes/productRoutes.js

import express from "express";

// Import controller functions (to be created)
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyShopProducts,
  getProductsByShop,
} from "../controllers/productController.js";

// Import middleware
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// --- Public Routes ---
// Anyone can view products
router.route("/").get(getAllProducts);

// --- Protected Routes for Shop Owners ---
router
  .route("/my-products")
  .get(protect, restrictTo("shop-owner"), getMyShopProducts);

// Create a new product (only for shop-owners)
router
  .route("/")
  .post(
    protect,
    restrictTo("shop-owner"),
    upload.array("images", 5),
    createProduct
  );

// Update or Delete a specific product (only for shop-owners)
// The controller will ensure the user owns the product before updating/deleting
router
  .route("/:id")
  .patch(
    protect,
    restrictTo("shop-owner"),
    upload.array("images", 5),
    updateProduct
  )
  .delete(protect, restrictTo("shop-owner"), deleteProduct);

router.route("/shop/:shopId").get(getProductsByShop);
router.route("/:id").get(getProductById);

export default router;
