import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// A helper function to populate cart details consistently
const populateCart = (cart) => {
  return cart.populate({
    path: "items.product",
    select: "name brand images shop requiresPrescription",
    populate: {
      path: "shop",
      select: "name",
    },
  });
};

// @desc    Get or create a user's cart
export const getMyCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }
  const populatedCart = await populateCart(cart);
  res.status(200).json({ success: true, data: populatedCart });
});

// @desc    Add or update an item in the cart
export const addItemToCart = asyncHandler(async (req, res) => {
  const { product: productData, quantity } = req.body;
  const productId = productData._id;
  let cart = await Cart.findOne({ user: req.user.id });

  const productDetails = await Product.findById(productId);
  if (!productDetails) throw new Error("Product not found");

  // Enforce single-shop restriction
  if (cart.items.length > 0) {
    const existingShop = cart.items[0].shop;
    if (existingShop && existingShop.toString() !== productDetails.shop.toString()) {
      res.status(400);
      throw new Error("You can only add products from one shop at a time.");
    }
  }

  const variant = productData.variant;
  const itemPrice = variant ? variant.price : productDetails.price;
  const itemIdentifier = variant ? variant._id : null;

  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (item.variant?._id?.toString() || "null") === (itemIdentifier?.toString() || "null")
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      variant,
      price: itemPrice,
      name: productData.name,
      image: productDetails.images[0],
      shop: productDetails.shop,
    });
  }

  await cart.save();
  const populatedCart = await populateCart(cart);
  res.status(200).json({ success: true, data: populatedCart });
});

export const updateItemQuantity = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });

  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (item.variant?._id?.toString() || "null") === (variantId || "null")
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  } else {
    throw new Error("Item not found in cart.");
  }

  await cart.save();
  const populatedCart = await populateCart(cart);
  res.status(200).json({ success: true, data: populatedCart });
});

// @desc    Remove an item from the cart
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const updatedCart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    {
      $pull: {
        items: {
          product: productId,
          "variant._id": variantId === "null" ? null : variantId,
        },
      },
    },
    { new: true }
  );
  const populatedCart = await populateCart(updatedCart);
  res.status(200).json({ success: true, data: populatedCart });
});

// @desc    Clear the entire cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [] },
    { new: true }
  );
  res.status(200).json({ success: true, data: cart });
});
