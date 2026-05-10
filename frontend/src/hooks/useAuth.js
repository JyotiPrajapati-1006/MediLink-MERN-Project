// src/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Import the context itself

/**
 * A custom hook to provide access to the AuthContext.
 * It simplifies consuming the context in components.
 * @returns {Object} The context value (user, isAuthenticated, login, logout, etc.).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // If the hook is used outside of the AuthProvider, it will throw an error.
  // This is a good practice to catch bugs early.
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
