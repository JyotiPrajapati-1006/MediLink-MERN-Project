// models/Category.js

import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A category must have a name."],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot be more than 50 characters."],
    },
    slug: {
      type: String,
      unique: true,
    },
    // Self-referencing for sub-categories
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      default: null, // null indicates this is a top-level category
    },
    image: {
      type: String,
      required: [true, "A category must have an image."],
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Middleware to create a URL-friendly slug from the name before saving
categorySchema.pre("save", function (next) {
  // Only generate slug if the name is new or modified
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
