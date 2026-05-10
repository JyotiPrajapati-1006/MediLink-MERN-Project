// src/context/OrderContext.jsx

import React, { createContext, useContext, useReducer } from 'react';
import orderService from '../api/orderService';
import { useCallback } from 'react';


// 1. Define the initial state for the context
const initialState = {
  orders: [],
  order: null, // For a single order view
  loading: false,
  error: null,
};

// 2. Create the context
const OrderContext = createContext(initialState);

// 3. Create the reducer function to manage state changes
const orderReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_ORDERS_REQUEST':
    case 'FETCH_ORDER_REQUEST':
    case 'CREATE_ORDER_REQUEST':
      return { ...state, loading: true, error: null };

    case 'FETCH_ORDERS_SUCCESS':
      return { ...state, loading: false, orders: action.payload };

    case 'FETCH_ORDER_SUCCESS':
    case 'CREATE_ORDER_SUCCESS':
      return { ...state, loading: false, order: action.payload };

    case 'FETCH_ORDERS_FAIL':
    case 'FETCH_ORDER_FAIL':
    case 'CREATE_ORDER_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

// ... (initialState and orderReducer remain the same) ...

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // --- Action Functions ---

  // 2. Wrap async functions in useCallback to prevent re-creation on every render
  const fetchMyOrders = useCallback(async () => {
    dispatch({ type: 'FETCH_ORDERS_REQUEST' });
    try {
      const data = await orderService.getMyOrders();
      dispatch({ type: 'FETCH_ORDERS_SUCCESS', payload: data.data });
    } catch (error) {
      dispatch({ type: 'FETCH_ORDERS_FAIL', payload: error.response?.data?.message || error.message });
    }
  }, []); // Empty dependency array means the function is created only once

  const fetchOrderById = useCallback(async (orderId) => {
    dispatch({ type: 'FETCH_ORDER_REQUEST' });
    try {
      const data = await orderService.getOrderById(orderId);
      dispatch({ type: 'FETCH_ORDER_SUCCESS', payload: data.data });
    } catch (error) {
      dispatch({ type: 'FETCH_ORDER_FAIL', payload: error.response?.data?.message || error.message });
    }
  }, []);

  const createOrder = useCallback(async (orderData) => {
    dispatch({ type: 'REQUEST' });
    try {
      // orderService.createOrder returns the full response: { success: true, data: orderObject }
      const response = await orderService.createOrder(orderData);
      dispatch({ type: 'CREATE_SUCCESS', payload: response.data });
      return response; // Return the ENTIRE response object
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create order.';
      dispatch({ type: 'FAIL', payload: errorMessage });
      throw error;
    }
  }, []);


  const value = {
    ...state,
    fetchMyOrders,
    fetchOrderById,
    createOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// ... (useOrders hook remains the same) ...
// 5. Create a custom hook for easy consumption
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};