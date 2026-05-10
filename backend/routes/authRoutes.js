// routes/authRoutes.js

import express from "express";

// Import controller functions (to be created)
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateMyPassword,
  getMe,
  googleLogin,
  sendRegistrationOtp,
  verifyOtpAndRegister,
  sendPasswordlessLoginOtp,
  verifyPasswordlessLogin,
} from "../controllers/authController.js";

// Import middleware
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Public Routes ---
router.post("/register", register);
router.post("/login", login);
router.post("/send-passwordless-otp", sendPasswordlessLoginOtp);
router.post("/verify-passwordless", verifyPasswordlessLogin);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.post("/google", googleLogin);
router.post("/send-register-otp", sendRegistrationOtp);
router.post("/verify-register", verifyOtpAndRegister);
// --- Protected Routes (Require user to be logged in) ---

// All routes below this point will use the 'protect' middleware
router.use(protect);

router.get("/me", getMe);
router.patch("/update-my-password", updateMyPassword);

export default router;
