// src/api/api.js

import axios from "axios";

// Create a new axios instance with a custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Base URL for all API requests
});

api.interceptors.request.use(
  (config) => {
    // Get user info from localStorage (assuming it's stored as a JSON string)
    const userInfo = localStorage.getItem("userInfo");

    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check for a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., by logging the user out
      localStorage.removeItem("userInfo");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
