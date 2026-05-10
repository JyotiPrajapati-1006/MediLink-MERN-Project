import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import userService from '../api/userService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await userService.getWishlist();
      setWishlistItems(response.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
      setWishlistItems([]); // Clear on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    try {
      const response = await userService.addToWishlist(productId);
   
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Failed to add to wishlist', error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await userService.removeFromWishlist(productId);
     
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const isItemInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const value = { wishlistItems, loading, addToWishlist, removeFromWishlist, isItemInWishlist };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);