// src/api/shopService.js
import api from "./api";

// Get the profile of the logged-in user's shop
const getMyShop = async () => {
  const response = await api.get("/shops/my-shop");
  return response.data;
};

const getShopById = async (shopId) => {
  const response = await api.get(`/shops/${shopId}`);
  return response.data;
};
const getAllShops = async (params) => {
  const response = await api.get("/shops", { params });
  return response.data;
};
// Create a shop profile for the logged-in owner
const createMyShop = async (shopData) => {
  const response = await api.post("/shops", shopData);
  return response.data;
};

// Get dashboard data for the logged-in shop owner
const getMyShopDashboard = async () => {
  const response = await api.get("/shops/my-shop/dashboard");
  return response.data;
};

// --- THIS FUNCTION WAS MISSING ---
// Get all orders for the owner's shop, with optional filters
const getMyShopOrders = async (params) => {
  const response = await api.get("/shops/my-shop/orders", { params });
  return response.data;
};

// Update the status of an order
const updateOrderStatus = async (orderId, statusData) => {
  const response = await api.patch(
    `/shops/my-shop/orders/${orderId}/status`,
    statusData
  );
  return response.data;
};

// Get all prescriptions for the owner's shop
const getMyShopPrescriptions = async (params) => {
  const response = await api.get("/shops/my-shop/prescriptions", { params });
  return response.data;
};

// Update a prescription's status
const updatePrescriptionStatus = async (prescriptionId, statusData) => {
  const response = await api.patch(
    `/shops/my-shop/prescriptions/${prescriptionId}/status`,
    statusData
  );
  return response.data;
};

const getAvailableDeliveryStaff = async () => {
  const response = await api.get("/shops/my-shop/delivery-staff");
  return response.data;
};


const updateMyShop = async (shopData) => {
  // We send shopData which is FormData
  const response = await api.patch("/shops/my-shop", shopData);
  return response.data;
};

// Get shop reports
const getShopReports = async (params) => {
  const response = await api.get("/shops/my-shop/reports", { params });
  return response.data;
};

const shopService = {
  getMyShop,
  getAllShops,
  createMyShop,
  getShopById,
  getMyShopDashboard,
  getMyShopOrders, // <-- Add the function to the export object
  updateOrderStatus,
  getMyShopPrescriptions,
  updatePrescriptionStatus,
  getAvailableDeliveryStaff,
  updateMyShop,
  getShopReports,
};

export default shopService;
