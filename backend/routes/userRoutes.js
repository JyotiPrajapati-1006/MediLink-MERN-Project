// routes/userRoutes.js

import express from "express";

// Import controller functions (to be created)
import {
  updateMyProfile,
  getMyProfile,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  getMyAddresses,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/userController.js";

// Import middleware
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply 'protect' middleware to all routes in this file
router.use(protect);

// --- User's Own Profile & Address Management ---

// Get or Update the logged-in user's profile
router.route("/me/profile").get(getMyProfile).patch(updateMyProfile);

// Get all addresses or add a new one
router.route("/me/addresses").get(getMyAddresses).post(addMyAddress);

// Update or delete a specific address by its ID
router
  .route("/me/addresses/:id")
  .patch(updateMyAddress)
  .delete(deleteMyAddress);

router.route("/me/wishlist").get(getWishlist).post(addToWishlist);

router.route("/me/wishlist/:productId").delete(removeFromWishlist);

export default router;
