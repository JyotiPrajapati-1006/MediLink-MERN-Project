import express from "express";
import {
  getMyCart,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  updateItemQuantity,
} from "../controllers/cartController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, restrictTo("customer"));

router.route("/").get(getMyCart).post(addItemToCart);

router.delete("/clear", clearCart);
router.patch("/items/:productId/:variantId", updateItemQuantity);
router.delete("/items/:productId/:variantId", removeItemFromCart);

export default router;
