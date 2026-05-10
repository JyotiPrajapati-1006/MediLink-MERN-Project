// src/hooks/useApi.js

import { useState, useCallback } from "react";

/**
 * A robust custom hook to handle API calls.
 * It manages loading, data, and error states.
 * It stores the entire response object from the service layer into its 'data' state.
 * @param {Function} apiFunc - The API service function to be called.
 * @returns {Object} An object containing data, loading, error, the request function, and a setData function.
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // The 'request' function will be called by the component to trigger the API call.
  const request = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        // The service function returns the full response object from axios (e.g., { success, data })
        const result = await apiFunc(...args);
        // We store this entire object in our state to maintain a consistent data structure
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        setError(errorMessage);
        throw err; // Re-throw for components that might want to handle the error further
      } finally {
        setLoading(false);
      }
    },
    [apiFunc] // Dependency array ensures the function is stable
  );

  return { data, loading, error, request, setData };
};
