// backend/routes/contactRoutes.js
import express from "express";
import { submitContactMessage } from "../controllers/contactController.js";

const router = express.Router();

// This is a public route, no protection needed
router.route("/").post(submitContactMessage);

export default router;
