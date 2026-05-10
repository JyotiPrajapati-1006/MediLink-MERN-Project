// models/Product.js

import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name."],
      trim: true,
    },
    slug: String,
    shop: {
      // Reference to the shop that owns/sells this product
      type: mongoose.Schema.ObjectId,
      ref: "Shop",
      required: [true, "A product must belong to a shop."],
    },
    images: [
      {
        type: String, // URLs from Cloudinary
        required: [true, "A product must have at least one image."],
      },
    ],
    description: { type: String, required: true },

    // --- NEW FIELDS TO ADD ---
    keyBenefits: { type: String },
    safetyAdvice: { type: String },
    countryOfOrigin: { type: String },
    brand: {
      type: String,
      required: [true, "A product must have a brand."],
    },
    description: {
      type: String,
      required: [true, "A product must have a description."],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "A product must belong to a category."],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price."],
      min: [0, "Price cannot be negative."],
      default: 0,
    },
    countInStock: {
      type: Number,
      required: [true, "Product stock quantity is required."],
      min: [0, "Stock cannot be negative."],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    manufacturer: { type: String, trim: true },
    consumeType: {
      type: String,
      enum: ["Oral", "Topical", "Injectable", "External", "Other"],
      default: "Oral",
    },
    returnPolicy: { type: String, trim: true },
    // For variants (like sizes, counts)
    variants: [
      {
        name: { type: String, required: true }, // e.g., "44 Count", "88 Count", "Large", "Small"
        price: { type: Number, required: true },
        mrp: { type: Number }, // Optional, for showing discount
        countInStock: { 
          type: Number, 
          required: true, 
          default: 0,
          min: [0, "Variant stock cannot be negative."],
          validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
          }
        },
        sku: { type: String, trim: true }, // Stock Keeping Unit for this variant
      },
    ],
    attributes: [
      {
        key: String,
        value: String,
      },
    ],
    expiryDate: {
      type: Date,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    isActive: {
      // Allows shop owner to temporarily show/hide a product
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index to ensure a product name is unique per shop
productSchema.index({ name: 1, shop: 1 }, { unique: true });

// Middleware to create a URL-friendly slug from the name before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
