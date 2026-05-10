// app.js

// Import dependencies
import express from "express";
import cors from "cors";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
// import rateLimit from "express-rate-limit";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
// Import error handler middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Init express app
const app = express();

// Body parser, reading data from body into req.body
app.use(express.json());

// --- GLOBAL MIDDLEWARE ---

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Health check route
app.get("/", (req, res) => {
  res.send("MediLink API is running...");
});

// Mount API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/shops", shopRoutes);
app.use("/api/v1/delivery", deliveryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/prescriptions", prescriptionRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/coupons", couponRoutes);
// --- ERROR HANDLING MIDDLEWARE ---

// Handle 404 - Not Found routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Export app to be used in server.js
export default app;
