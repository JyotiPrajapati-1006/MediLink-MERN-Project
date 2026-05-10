import express from "express";
import {
  createRoleRequest,
  getAdminNotifications,
  resolveRoleRequest,
} from "../controllers/notificationController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Route for a user to create a request
router.post(
  "/role-request",
  protect,
  upload.single("license"),
  createRoleRequest
);

// Routes for admin to manage requests
router.get("/admin", protect, restrictTo("admin"), getAdminNotifications);
router.patch(
  "/admin/:id/resolve",
  protect,
  restrictTo("admin"),
  resolveRoleRequest
);

export default router;
