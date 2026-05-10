import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../api/cartService';
import couponService from '../api/couponService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// --- Pricing Constants ---
const HANDLING_FEE = 10;
const PLATFORM_FEE = 6;
const DELIVERY_FEE = 40;
const GST_PERCENTAGE = 12; // 12% Per-order GST

// --- Helper function to calculate all cart totals ---
const calculateTotals = (items = [], coupon = null) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subTotal = items.reduce((total, item) => {
    const itemPrice = item.variant ? item.variant.price : item.price;
    return total + itemPrice * item.quantity;
  }, 0);
  const mrpTotal = items.reduce((total, item) => {
    const itemMrp = item.variant ? (item.variant.mrp || item.variant.price) : (item.mrp || item.price);
    return total + itemMrp * item.quantity;
  }, 0);

  const totalDiscountOnMrp = mrpTotal - subTotal;
  const deliveryFee = subTotal === 0 ? 0 : DELIVERY_FEE;
  let couponDiscount = 0;
  if (coupon) {
    couponDiscount = (subTotal * coupon.discountPercent) / 100;
  }

  const taxableAmount = subTotal - couponDiscount;
  const gstAmount = taxableAmount > 0 ? (taxableAmount * GST_PERCENTAGE) / 100 : 0;

  const totalPrice = subTotal + (subTotal > 0 ? (HANDLING_FEE + PLATFORM_FEE + gstAmount) : 0) + deliveryFee - couponDiscount;

  return {
    itemCount, subTotal, mrpTotal, totalDiscountOnMrp,
    handlingFee: subTotal > 0 ? HANDLING_FEE : 0,
    platformFee: subTotal > 0 ? PLATFORM_FEE : 0,
    deliveryFee, couponDiscount, gstAmount,
    totalPrice: totalPrice > 0 ? totalPrice : 0,
    appliedCoupon: coupon,
  };
};

const initialState = {
  cartItems: [],
  ...calculateTotals([]),
};

const CartContext = createContext(initialState);

export const CartProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const updateCartState = useCallback((cartData, coupon = state.appliedCoupon) => {
    const items = cartData?.items || [];
    const totals = calculateTotals(items, coupon);
    setState({ cartItems: items, ...totals });
  }, [state.appliedCoupon]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setState(initialState);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await cartService.getMyCart();
      updateCartState(response.data.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, updateCartState]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity) => {
    if (state.cartItems.length > 0) {
      const existingShopId = state.cartItems[0].product?.shop?._id || state.cartItems[0].product?.shop || state.cartItems[0].shop;
      const newShopId = product?.shop?._id || product?.shop;

      if (existingShopId && newShopId && String(existingShopId) !== String(newShopId)) {
        toast.error("You can only add products from one shop at a time. Please clear your cart first.");
        return;
      }
    }

    try {
      const response = await cartService.addToCart({ product, quantity });
      updateCartState(response.data.data);
      toast.success('Item added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item.");
    }
  };

  const removeFromCart = async (productId, variantId) => {
    try {
      const response = await cartService.removeFromCart(productId, variantId);
      updateCartState(response.data.data);
      toast.success('Item removed from cart.');
    } catch (error) {
      toast.error("Failed to remove item.");
    }
  };

  const updateQuantity = async (productId, quantity, variantId) => {
    if (quantity < 1) {
      return removeFromCart(productId, variantId);
    }
    try {
      const response = await cartService.updateItemQuantity(productId, variantId, quantity);
      updateCartState(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update quantity.");
    }
  };
  const clearCart = async () => {
    try {
      await cartService.clearCart();
      updateCartState({ items: [] }, null);
      toast.success('Cart cleared!');
    } catch (error) {
      toast.error('Failed to clear cart.');
    }
  };

  const applyCoupon = async (code) => {
    if (state.cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }

    // Get shop ID from first item 
    const shopId = state.cartItems[0].product?.shop?._id || state.cartItems[0].product?.shop || state.cartItems[0].shop;

    try {
      const response = await couponService.verifyCoupon(code, shopId);
      const coupon = response.data;
      updateCartState(state.cartItems, coupon);
      toast.success('Coupon applied successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    updateCartState(state.cartItems, null);
    toast.success('Coupon removed.');
  };

  const value = { ...state, loading, addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);