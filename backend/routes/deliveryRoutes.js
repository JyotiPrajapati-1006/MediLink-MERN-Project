// routes/deliveryRoutes.js

import express from "express";

// Import controller functions (to be created)
import {
  getMyAssignedTasks,
  getOrderDetails,
  updateOrderStatusToPickedUp,
  updateOrderStatusToDelivered,
  getMyDeliveryHistory,
  getPickupTasks,
  getActiveDeliveries,
  updateDeliveryStatus,
  getAvailableTasks,
  getMyActiveTasks,
  acceptTask,
  sendDeliveryOtp,
  verifyDeliveryOtp,
} from "../controllers/deliveryController.js";

// Import middleware
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protect and restrictTo middleware to all routes in this file
router.use(protect);
router.use(restrictTo("delivery-staff"));

// --- Delivery Staff Routes ---

// Get all active/assigned orders for the logged-in delivery staff
router.get("/my-tasks", getMyAssignedTasks);

// Get the delivery history for the logged-in delivery staff
router.get("/history", getMyDeliveryHistory);

// Get details of a specific assigned order
router.get("/orders/:id", getOrderDetails);

router.get("/available-tasks", getAvailableTasks);
router.get("/my-tasks", getMyActiveTasks);
router.patch("/tasks/:orderId/accept", acceptTask);
router.post("/orders/:orderId/send-otp", sendDeliveryOtp);
router.post("/orders/:orderId/verify-otp", verifyDeliveryOtp);

router.get("/pickup-tasks", getPickupTasks);
router.get("/active-deliveries", getActiveDeliveries);
router.patch("/orders/:orderId/status", updateDeliveryStatus);

// Update the status of an order
router.patch("/orders/:id/pick-up", updateOrderStatusToPickedUp);
router.patch("/orders/:id/deliver", updateOrderStatusToDelivered);

export default router;
