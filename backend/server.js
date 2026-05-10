// server.js

// Import dependencies
import dotenv from "dotenv";
import app from "./app.js"; // Main express app
import connectDB from "./config/db.js"; // DB connection logic

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Get port from env, default to 5000
const PORT = process.env.PORT || 5000;

// Start server listening using app.listen()
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
