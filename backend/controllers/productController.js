// controllers/productController.js

import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import APIFeatures from "../utils/apiFeatures.js";
import Category from "../models/Category.js";

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("shop", "name")
    .populate("category", "name slug parent"); // Populate category and shop details, include slug and parent for breadcrumbs

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  res.status(200).json({ success: true, data: product });
});

const getAllDescendantIds = async (categoryId) => {
  const categoriesToSearch = [categoryId];
  const allIds = [categoryId];

  while (categoriesToSearch.length > 0) {
    const currentId = categoriesToSearch.shift();
    const children = await Category.find({ parent: currentId }).select("_id");
    const childIds = children.map((c) => c._id);

    if (childIds.length > 0) {
      allIds.push(...childIds);
      categoriesToSearch.push(...childIds);
    }
  }
  return allIds;
};

export const getAllProducts = asyncHandler(async (req, res) => {
  const approvedShops = await Shop.find({ status: "Approved" }).select("_id");
  const approvedShopIds = approvedShops.map((shop) => shop._id);

  const filter = {
    isActive: true,
    shop: { $in: approvedShopIds },
  };

  if (req.query.category) {
    const allCategoryIds = await getAllDescendantIds(req.query.category);
    filter.category = { $in: allCategoryIds };
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { brand: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const features = new APIFeatures(
    Product.find(filter).populate("shop", "name"),
    req.query
  )
    .sort()
    .paginate();

  const products = await features.query;
  const totalProducts = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: products.length,
    total: totalProducts,
    data: products,
  });
});

// Add or update these two functions in your productController.js

export const createProduct = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) throw new Error("You must have a shop to add products.");

  const { variants, attributes, ...restOfBody } = req.body;
  const productData = { ...restOfBody, shop: shop._id };

  if (variants) productData.variants = JSON.parse(variants);
  if (attributes) productData.attributes = JSON.parse(attributes);
  if (req.files) productData.images = req.files.map((file) => file.path);

  const product = await Product.create(productData);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) throw new Error("Product not found.");

  const { variants, attributes, ...restOfBody } = req.body;
  const updatedData = { ...restOfBody };

  if (variants) updatedData.variants = JSON.parse(variants);
  if (attributes) updatedData.attributes = JSON.parse(attributes);
  if (req.files && req.files.length > 0) {
    updatedData.images = req.files.map((file) => file.path);
  }

  product = await Product.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: product });
});

// Get all products for a specific shop (Public)
export const getProductsByShop = asyncHandler(async (req, res) => {
  const filter = {
    shop: req.params.shopId,
    isActive: true,
  };

  if (req.query.category) {
    const allCategoryIds = await getAllDescendantIds(req.query.category);
    filter.category = { $in: allCategoryIds };
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { brand: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const products = await Product.find(filter);
  res
    .status(200)
    .json({ success: true, count: products.length, data: products });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  // Authorization check: Ensure the user owns this product
  const shop = await Shop.findOne({ owner: req.user._id });
  if (product.shop.toString() !== shop._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to delete this product.");
  }

  await product.deleteOne();

  res.status(204).json({ success: true, data: null });
});

export const getMyShopProducts = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found for this user.");
  }
  const products = await Product.find({ shop: shop._id });
  res
    .status(200)
    .json({ success: true, count: products.length, data: products });
});
