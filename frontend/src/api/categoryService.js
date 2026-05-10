// src/api/categoryService.js
import api from "./api";

// Get all categories in a nested tree structure
const getAllCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

// Create a new category
const createCategory = async (categoryData) => {
  const response = await api.post("/admin/categories", categoryData);
  return response.data;
};

// Update a category by its ID
const updateCategory = async (categoryId, categoryData) => {
  const response = await api.patch(
    `/admin/categories/${categoryId}`,
    categoryData
  );
  return response.data;
};

// Delete a category by its ID
const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/admin/categories/${categoryId}`);
  return response.data;
};

const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
