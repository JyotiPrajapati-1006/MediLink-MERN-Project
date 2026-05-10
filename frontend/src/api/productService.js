import api from "./api";

// For Customers (Public)
const getAllProducts = async (params) => {
  const response = await api.get("/products", { params });
  return response.data;
};
const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};
const getProductsByShop = async (shopId, params) => {
  const response = await api.get(`/products/shop/${shopId}`, { params });
  return response.data;
};
// For Shop Owners (Protected)
const getMyShopProducts = async () => {
  const response = await api.get("/products/my-products");
  return response.data;
};
const createProduct = async (formData) => {
  const response = await api.post("/products", formData); // FormData will be sent
  return response.data;
};
const updateProduct = async (productId, formData) => {
  const response = await api.patch(`/products/${productId}`, formData);
  return response.data;
};
const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

const productService = {
  getAllProducts,
  getProductById,
  getMyShopProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByShop,
};

export default productService;
