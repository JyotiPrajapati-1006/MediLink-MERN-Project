import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";
import Shop from "../models/Shop.js";

// @desc    Get all coupons for a shop owner's shop
export const getShopCoupons = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found for this user.");
  }

  const coupons = await Coupon.find({ shop: shop._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: coupons.length, data: coupons });
});

// @desc    Create a new coupon for the shop
export const createCoupon = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found for this user.");
  }

  const { code, discountPercent, expiryDate, isActive } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image for the coupon.");
  }

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), shop: shop._id });
  if (existingCoupon) {
    res.status(400);
    throw new Error("A coupon with this code already exists for your shop.");
  }

  const coupon = await Coupon.create({
    code,
    discountPercent,
    shop: shop._id,
    image: req.file.path,
    expiryDate,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({ success: true, data: coupon });
});

// @desc    Update a coupon
export const updateCoupon = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) throw new Error("Shop not found.");

  let coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found.");
  }

  if (coupon.shop.toString() !== shop._id.toString()) {
    res.status(403);
    throw new Error("You do not have permission to update this coupon.");
  }

  const updateData = { ...req.body };
  if (req.file) {
    updateData.image = req.file.path;
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: coupon });
});

// @desc    Delete a coupon
export const deleteCoupon = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) throw new Error("Shop not found.");

  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found.");
  }

  if (coupon.shop.toString() !== shop._id.toString()) {
    res.status(403);
    throw new Error("You do not have permission to delete this coupon.");
  }

  await coupon.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Verify and apply a coupon (Public)
export const verifyCoupon = asyncHandler(async (req, res) => {
  const { code, shopId } = req.body;

  if (!code || !shopId) {
    res.status(400);
    throw new Error("Please provide a coupon code and shop ID.");
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    shop: shopId,
    isActive: true,
    expiryDate: { $gt: new Date() },
  });

  if (!coupon) {
    res.status(400);
    throw new Error("Invalid or expired coupon for this shop.");
  }

  res.status(200).json({ success: true, data: coupon });
});

// @desc    Get active coupons for a specific shop (Public)
export const getCouponsByShopId = asyncHandler(async (req, res) => {
  const shopId = req.params.shopId;
  
  if (!shopId) {
    res.status(400);
    throw new Error("Shop ID is required.");
  }

  const coupons = await Coupon.find({
    shop: shopId,
    isActive: true,
    expiryDate: { $gt: new Date() },
  }).select("-__v -updatedAt");

  res.status(200).json({ success: true, count: coupons.length, data: coupons });
});

// @desc    Get all global active coupons for homepage advertisements (Public)
export const getAllActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: new Date() },
  }).populate("shop", "name").select("-__v -updatedAt");

  res.status(200).json({ success: true, count: coupons.length, data: coupons });
});
