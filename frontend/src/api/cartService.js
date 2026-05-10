import api from "./api";

const getMyCart = async () => {
  const response = await api.get("/cart");
  return response;
};
const addToCart = async (itemData) => {
  const response = await api.post("/cart", itemData);
  return response;
};
const removeFromCart = async (productId, variantId) => {
  const response = await api.delete(
    `/cart/items/${productId}/${variantId || "null"}`
  );
  return response;
};
const updateItemQuantity = async (productId, variantId, quantity) => {
  return await api.patch(`/cart/items/${productId}/${variantId || "null"}`, {
    quantity,
  });
};
const clearCart = async () => {
  const response = await api.delete("/cart/clear");
  return response;
};

const cartService = {
  getMyCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  clearCart,
};
export default cartService;
