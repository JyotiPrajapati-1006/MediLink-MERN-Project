// src/api/userService.js
import api from "./api";

// Get the logged-in user's full profile
const getMyProfile = async () => {
  const response = await api.get("/users/me/profile");
  return response.data;
};

// Update the logged-in user's profile
const updateMyProfile = async (profileData) => {
  const response = await api.patch("/users/me/profile", profileData);
  return response.data;
};

// Add a new address
const addMyAddress = async (addressData) => {
  const response = await api.post("/users/me/addresses", addressData);
  return response.data;
};

// Update an existing address
const updateMyAddress = async (addressId, addressData) => {
  const response = await api.patch(
    `/users/me/addresses/${addressId}`,
    addressData
  );
  return response.data;
};

// Delete an address
const deleteMyAddress = async (addressId) => {
  const response = await api.delete(`/users/me/addresses/${addressId}`);
  return response.data;
};

const getWishlist = async () => {
  const response = await api.get("/users/me/wishlist");
  return response.data;
};
const addToWishlist = async (productId) => {
  const response = await api.post("/users/me/wishlist", { productId });
  return response.data;
};
const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/users/me/wishlist/${productId}`);
  return response.data;
};

const userService = {
  getMyProfile,
  updateMyProfile,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default userService;
