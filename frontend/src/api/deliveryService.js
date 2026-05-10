// src/api/deliveryService.js

import api from "./api";

// Get all active tasks for the logged-in delivery staff
const getMyTasks = async () => {
  const response = await api.get("/delivery/my-tasks");
  return response.data;
};

// Update order status to 'Shipped' (Picked Up)
const markAsPickedUp = async (orderId) => {
  const response = await api.patch(`/delivery/orders/${orderId}/pick-up`);
  return response.data;
};

// Update order status to 'Delivered'
const markAsDelivered = async (orderId) => {
  const response = await api.patch(`/delivery/orders/${orderId}/deliver`);
  return response.data;
};

const getMyDeliveryHistory = async () => {
  const response = await api.get("/delivery/history");
  return response.data;
};

const getPickupTasks = async () => {
  const response = await api.get("/delivery/pickup-tasks");
  return response.data;
};
const getActiveDeliveries = async () => {
  const response = await api.get("/delivery/active-deliveries");
  return response.data;
};
const updateDeliveryStatus = async (orderId, status) => {
  const response = await api.patch(`/delivery/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

const getAvailableTasks = async () => {
  const response = await api.get("/delivery/available-tasks");
  return response.data;
};

const getMyActiveTasks = async () => {
  const response = await api.get("/delivery/my-tasks");
  return response.data;
};

const acceptTask = async (orderId) => {
  const response = await api.patch(`/delivery/tasks/${orderId}/accept`);
  return response.data;
};

const sendDeliveryOtp = async (orderId) => {
  const response = await api.post(`/delivery/orders/${orderId}/send-otp`);
  return response.data;
};
const verifyDeliveryOtp = async (orderId, otp) => {
  const response = await api.post(`/delivery/orders/${orderId}/verify-otp`, {
    otp,
  });
  return response.data;
};
const deliveryService = {
  getMyTasks,
  markAsPickedUp,
  markAsDelivered,
  getMyDeliveryHistory,
  getPickupTasks,
  getActiveDeliveries,
  updateDeliveryStatus,
  getAvailableTasks,
  getMyActiveTasks,
  acceptTask,
  sendDeliveryOtp,
  verifyDeliveryOtp,
};

export default deliveryService;
