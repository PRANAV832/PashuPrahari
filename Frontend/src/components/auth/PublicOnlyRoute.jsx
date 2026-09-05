import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTES } from '../../services/authService';

/**
 * Route wrapper for public-only pages like /login and /verify-otp.
 * If user is already authenticated, redirects directly to their role-based dashboard.
 */
export const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const homeRoute = ROLE_HOME_ROUTES[user.role] || '/veterinarian/dashboard';
    return <Navigate to={homeRoute} replace />;
  }

  return children;
};
