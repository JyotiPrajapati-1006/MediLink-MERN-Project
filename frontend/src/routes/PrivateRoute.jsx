// src/routes/PrivateRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

/**
 * A wrapper component to protect routes.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The component to render if the user is authenticated and authorized.
 * @param {string[]} [props.allowedRoles] - An optional array of roles that are allowed to access this route.
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 1. Show a spinner while the auth state is being determined on initial load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 2. If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    // We pass the current location in the state so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If roles are specified and the user's role is not in the allowed list, redirect to an unauthorized page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // You can create an 'UnauthorizedPage' for a better user experience
    return <Navigate to="/" replace />;
  }

  // 4. If authenticated and authorized, render the child component
  return children;
};

export default PrivateRoute;