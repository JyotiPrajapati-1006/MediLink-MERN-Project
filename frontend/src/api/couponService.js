// src/api/couponService.js
import api from "./api";

// Verify a coupon code against a specific shop
const verifyCoupon = async (code, shopId) => {
  const response = await api.post("/coupons/verify", { code, shopId });
  return response.data;
};

// Public: Get all active coupons for a specific shop
const getCouponsByShopId = async (shopId) => {
  const response = await api.get(`/coupons/shop/${shopId}`);
  return response.data;
};

// Public: Get all global active coupons for the homepage
const getAllActiveCoupons = async () => {
  const response = await api.get("/coupons/global/active");
  return response.data;
};

// Shop Owner: Get all coupons
const getShopCoupons = async () => {
  const response = await api.get("/coupons");
  return response.data;
};

// Shop Owner: Create a new coupon
const createCoupon = async (couponData) => {
  // Use config to ensure proper handling of FormData by the `api` interceptor
  const response = await api.post("/coupons", couponData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Shop Owner: Update a coupon
const updateCoupon = async (couponId, couponData) => {
  const response = await api.patch(`/coupons/${couponId}`, couponData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Shop Owner: Delete a coupon
const deleteCoupon = async (couponId) => {
  const response = await api.delete(`/coupons/${couponId}`);
  return response.data;
};

const couponService = {
  verifyCoupon,
  getCouponsByShopId,
  getAllActiveCoupons,
  getShopCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};

export default couponService;
