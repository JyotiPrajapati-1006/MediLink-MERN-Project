// controllers/userController.js

import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// --- Profile Management ---

export const getMyProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.bankDetails) {
      user.bankDetails = { ...user.bankDetails, ...req.body.bankDetails };
    }
    const updatedUser = await user.save();
    res.status(200).json({ success: true, data: updatedUser });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// --- Address Management ---
export const getMyAddresses = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.addresses });
});

export const addMyAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.addresses.push(req.body);
    const updatedUser = await user.save();
    res.status(201).json({ success: true, data: updatedUser });
  } else {
    /* ... error handling ... */
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateMyAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    const address = user.addresses.id(req.params.id);
    if (address) {
      address.set(req.body);
      const updatedUser = await user.save();
      res.status(200).json({ success: true, data: updatedUser });
    } else {
      res.status(404);
      throw new Error("Address not found");
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const deleteMyAddress = asyncHandler(async (req, res) => {
  // Find the user by their ID and use the $pull operator to
  // atomically remove the address subdocument that matches the provided ID.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { addresses: { _id: req.params.id } } },
    { new: true } // This option ensures the updated document is returned
  );

  // If no user was found and updated, updatedUser will be null.
  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Send the updated user object (with the address removed) back to the client.
  res.status(200).json({ success: true, data: updatedUser });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.status(200).json({ success: true, data: user.wishlist });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { wishlist: productId } }, // $addToSet prevents duplicates
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Product added to wishlist.",
    data: user.wishlist,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { wishlist: productId } },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Product removed from wishlist.",
    data: user.wishlist,
  });
});
