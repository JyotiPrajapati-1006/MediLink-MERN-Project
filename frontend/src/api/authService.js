// src/api/authService.js

import api from "./api"; // Import the configured axios instance

// Function to register a new user
const register = async (userData) => {
  // POST request to the register endpoint
  const response = await api.post("/auth/register", userData);

  // If registration is successful, store user info in localStorage
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }

  return response.data;
};

// Function to log in a user
const login = async (credentials) => {
  // POST request to the login endpoint
  const response = await api.post("/auth/login", credentials);

  // On successful login, the backend should send back user data with a token.
  // We store this in localStorage to keep the user logged in.
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }

  return response.data;
};

// Function to log out a user
const logout = () => {
  // Simply remove the user info from localStorage
  localStorage.clear();
};

const googleLogin = async (credential) => {
  const response = await api.post("/auth/google", { credential });
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};
const sendRegistrationOtp = async (email) => {
  const response = await api.post("/auth/send-register-otp", { email });
  return response.data;
};

const verifyOtpAndRegister = async (userData) => {
  const response = await api.post("/auth/verify-register", userData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

const sendPasswordlessLoginOtp = async (email) => {
  const response = await api.post("/auth/send-passwordless-otp", { email });
  return response.data;
};

const verifyPasswordlessLogin = async (data) => {
  const response = await api.post("/auth/verify-passwordless", data);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};
// Function to get the current logged-in user's profile
const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};
const resetPassword = async (token, password) => {
  const response = await api.patch(`/auth/reset-password/${token}`, {
    password,
  });
  return response.data;
};
// Create an object to export all functions
const authService = {
  register,
  login,
  logout,
  googleLogin,
  sendRegistrationOtp,
  verifyOtpAndRegister,
  getMe,
  sendPasswordlessLoginOtp,
  verifyPasswordlessLogin,
  forgotPassword,
  resetPassword,
};

export default authService;
