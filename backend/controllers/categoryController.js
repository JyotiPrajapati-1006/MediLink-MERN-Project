// controllers/categoryController.js

import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";


export const createCategory = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;

  // THE FIX: Check if a file was uploaded.
  if (!req.file) {
    res.status(400);
    throw new Error("Category image is required. Please upload an image.");
  }

  // req.file.path is provided by multer-storage-cloudinary
  const image = req.file.path;

  const category = await Category.create({ name, parent, image });
  res.status(201).json({ success: true, data: category });
});


export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});

  // Helper function to build a nested tree
  const buildTree = (list) => {
    const map = {};
    const roots = [];

    // First, map the nodes of the tree
    for (let i = 0; i < list.length; i++) {
      map[list[i]._id] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    // Connect children to their parents
    for (let i = 0; i < list.length; i++) {
      const node = list[i];
      if (node.parent) {
        // If you have a parent, push yourself into your parent's children
        if (list[map[node.parent]]) {
          list[map[node.parent]].children.push(node);
        }
      } else {
        // If you don't have a parent, you're a root
        roots.push(node);
      }
    }
    return roots;
  };

  const categoryTree = buildTree(JSON.parse(JSON.stringify(categories)));

  res
    .status(200)
    .json({ success: true, count: categories.length, data: categoryTree });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  category.name = name || category.name;
  category.parent = parent !== undefined ? parent : category.parent;

  // THE FIX: Only update the image if a new file is uploaded.
  if (req.file) {
    category.image = req.file.path;
  }

  const updatedCategory = await category.save();
  res.status(200).json({ success: true, data: updatedCategory });
});


export const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  // 1. Check if it's a parent to any other category
  const subcategories = await Category.find({ parent: categoryId });
  if (subcategories.length > 0) {
    res.status(400);
    throw new Error(
      "Cannot delete this category because it has subcategories. Please delete them first."
    );
  }

  // 2. Check if any product is using this category
  const products = await Product.find({ category: categoryId });
  if (products.length > 0) {
    res.status(400);
    throw new Error(
      "Cannot delete this category because it is used by products."
    );
  }

  // If checks pass, delete the category
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  res.status(204).json({ success: true, data: null });
});
