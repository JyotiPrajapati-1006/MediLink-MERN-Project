// src/api/adminService.js
import api from "./api";

// Get main dashboard statistics
const getDashboardStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// Get a list of recent orders
const getRecentOrders = async () => {
  // Assuming backend has an endpoint for recent orders
  const response = await api.get("/admin/orders?limit=5&sort=-createdAt");
  return response.data;
};

// Get a list of shops pending approval
const getPendingShops = async () => {
  const response = await api.get("/admin/shops/pending");
  return response.data;
};

// Get all users, with optional role filter
const getAllUsers = async (params) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

// Update a user's details by ID
const updateUser = async (userId, userData) => {
  const response = await api.patch(`/admin/users/${userId}`, userData);
  return response.data;
};

// Delete a user by ID
const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Get all shops, with optional status filter
const getAllShops = async (params) => {
  const response = await api.get("/admin/shops", { params });
  return response.data;
};

// Approve a shop
const approveShop = async (shopId) => {
  const response = await api.patch(`/admin/shops/${shopId}/approve`);
  return response.data;
};

// Reject a shop
const rejectShop = async (shopId) => {
  const response = await api.patch(`/admin/shops/${shopId}/reject`);
  return response.data;
};

const getAllReviews = async (params) => {
  const response = await api.get("/admin/reviews", { params });
  return response.data;
};
const updateReview = async (id, data) => {
  const response = await api.patch(`/admin/reviews/${id}`, data);
  return response.data;
};
const deleteReview = async (id) => {
  const response = await api.delete(`/admin/reviews/${id}`);
  return response.data;
};

// Get payout data for shops and delivery staff
const getPayoutsData = async () => {
  const response = await api.get("/admin/payouts");
  return response.data;
};

// Clear shop's pending payouts
const clearShopPayout = async (shopId) => {
  const response = await api.patch(`/admin/payouts/shop/${shopId}/clear`);
  return response.data;
};

// Clear delivery staff pending payouts
const clearDeliveryPayout = async (staffId) => {
  const response = await api.patch(`/admin/payouts/delivery/${staffId}/clear`);
  return response.data;
};

// Get admin reports
const getAdminReports = async (params) => {
  const response = await api.get("/admin/reports", { params });
  return response.data;
};

const adminService = {
  getDashboardStats,
  getRecentOrders,
  getPendingShops,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllShops,
  approveShop,
  rejectShop,
  getAllReviews,
  updateReview,
  deleteReview,
  getPayoutsData,
  clearShopPayout,
  clearDeliveryPayout,
  getAdminReports,
};

export default adminService;
