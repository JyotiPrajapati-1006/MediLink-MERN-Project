// config/index.js

import dotenv from "dotenv";

// Ensure environment variables from .env are loaded
dotenv.config();

const config = {
  // Environment settings
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,

  // Database configuration
  db: {
    uri: process.env.MONGO_URI,
  },

  // JWT (JSON Web Token) configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  },

  // Cloudinary configuration for file uploads
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  // Email service configuration
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  razorpay: {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  },
};

export default config;
