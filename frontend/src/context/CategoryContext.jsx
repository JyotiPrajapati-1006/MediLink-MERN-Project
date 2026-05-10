import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import categoryService from '../api/categoryService';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const { data: categoriesData, loading, error, request: fetchCategories } = useApi(categoryService.getAllCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Create a flat map for easy lookup of any category by its ID or slug
  const categoryMap = useMemo(() => {
    if (!categoriesData?.data) return new Map();
    const map = new Map();
    const traverse = (categories) => {
      for (const category of categories) {
        map.set(category._id, category);
        map.set(category.slug, category);
        if (category.children && category.children.length > 0) {
          traverse(category.children);
        }
      }
    };
    traverse(categoriesData.data);
    return map;
  }, [categoriesData]);

  const value = {
    allCategories: categoriesData?.data || [],
    categoryMap,
    loading,
    error
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

export const useCategories = () => useContext(CategoryContext);