// backend/routes/prescriptionRoutes.js
import express from "express";
import { getMyPrescriptions } from "../controllers/prescriptionController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected
router.use(protect);

router.route("/").get(restrictTo("customer"), getMyPrescriptions);

export default router;
