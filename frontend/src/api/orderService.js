// src/api/orderService.js

import api from "./api"; // Import the configured axios instance

// Function to create a new order
const createOrder = async (orderData) => {
  // orderData can be a normal object or FormData
  const response = await api.post("/orders", orderData);
  return response.data;
};

const createSplitOrder = async (orderData) => {
  // This API call sends data as JSON, not FormData
  const response = await api.post("/orders/create-split", orderData);
  return response.data;
};

// Function to get all orders for the logged-in user
const getMyOrders = async () => {
  // GET request to fetch user's orders
  const response = await api.get("/orders");
  return response.data;
};

// Function to get a single order by its ID
const getOrderById = async (orderId) => {
  // GET request to a specific order endpoint
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Function to cancel an order
const cancelMyOrder = async (orderId) => {
  // PATCH request to the cancel order endpoint
  const response = await api.patch(`/orders/${orderId}/cancel`);
  return response.data;
};

// Create an object to export all order-related functions
const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  createSplitOrder,
};

export default orderService;
