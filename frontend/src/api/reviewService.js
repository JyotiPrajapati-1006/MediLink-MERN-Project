// src/api/reviewService.js
import api from "./api";

const createShopReview = async (orderId, reviewData) => {
  const response = await api.post(`/reviews/shop/${orderId}`, reviewData);
  return response.data;
};
const getReviewsForShop = async (shopId) => {
  const response = await api.get(`/reviews/shop/${shopId}`);
  return response.data;
};
const reviewService = { createShopReview, getReviewsForShop };
export default reviewService;
