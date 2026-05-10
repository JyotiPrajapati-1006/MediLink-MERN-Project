// models/Shop.js

import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    owner: {
      // The user account of the shop owner
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A shop must have an owner."],
      unique: true, // One user can own only one shop
    },
    name: {
      type: String,
      required: [true, "A shop must have a name."],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a shop description."],
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    location: {
      // GeoJSON for location-based search
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude] format
        type: [Number],
        required: [true, "Shop location coordinates are required."],
      },
    },
    phone: {
      type: String,
      required: [true, "Shop contact number is required."],
    },
    email: {
      type: String,
      required: [true, "Shop contact email is required."],
    },
    images: [String], // URLs of shop photos (e.g., storefront)
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending", // Admin must approve new shops
    },
    isActive: {
      // Can be toggled by owner to open/close the shop on the platform
      type: Boolean,
      default: true,
    },
    deliveryRadius: {
      // Delivery range in kilometers
      type: Number,
      required: [true, "Please specify a delivery radius in km."],
    },
    rating: {
      // Average rating, calculated from reviews
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create a 2dsphere index for efficient geospatial queries
shopSchema.index({ location: "2dsphere" });

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
