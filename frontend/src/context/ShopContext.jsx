// src/context/ShopContext.jsx

import React, { createContext, useContext, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import shopService from '../api/shopService';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { data: shopResponse, loading, error, request: fetchShop } = useApi(shopService.getMyShop);

  // This function will be called to refresh the shop data
  const refetchShop = useCallback(() => {
    if (isAuthenticated && user?.role === 'shop-owner') {
      fetchShop();
    }
  }, [isAuthenticated, user, fetchShop]);

  // Fetch the shop data when the user logs in or on initial load
  useEffect(() => {
    refetchShop();
  }, [refetchShop]);

  const value = {
    shop: shopResponse?.data,
    isLoading: loading,
    error,
    refetchShop, // Expose the refetch function
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};