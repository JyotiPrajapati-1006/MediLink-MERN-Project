import express from "express";
import { getAllCategories } from "../controllers/categoryController.js";

const router = express.Router();

// Public route to get all categories
router.route("/").get(getAllCategories);

export default router;
