import api from "./api";

const createRazorpayOrder = async (orderData) => {
  const response = await api.post("/payment/create-order", orderData);
  return response.data;
};

const verifyPayment = async (paymentData) => {
  const response = await api.post("/payment/verify", paymentData);
  return response.data;
};

const paymentService = {
  createRazorpayOrder,
  verifyPayment,
};

export default paymentService;
