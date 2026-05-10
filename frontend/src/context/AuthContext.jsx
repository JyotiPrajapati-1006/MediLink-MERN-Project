import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';
import Spinner from '../components/common/Spinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // THE FIX: isLoading must start as TRUE
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          const { data, token } = JSON.parse(storedUserInfo);
          if (data && token) {
            setUser(data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Failed to parse user info, logging out.", error);
          localStorage.removeItem('userInfo');
        }
      }
      // This is CRITICAL: Set loading to false only after the check is complete.
      setIsLoading(false);
    };
    checkUserStatus();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    setUser(response.data);
    setIsAuthenticated(true);
    localStorage.setItem('userInfo', JSON.stringify(response)); // Save the whole response
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
    window.location.href = '/';
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.data);
    setIsAuthenticated(true);
    localStorage.setItem('userInfo', JSON.stringify(response));
    return response;
  };

  const value = { user, isAuthenticated, isLoading, login, logout, setUser, register };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};