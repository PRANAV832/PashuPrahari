import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTES } from '../../services/authService';

/**
 * Route guard for authenticated pages.
 * - Redirects unauthenticated users to /login
 * - Redirects unauthorized roles to their designated home dashboard
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, verify user's role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have required role for this specific route
    // Redirect them to their own role's home dashboard
    const roleHome = ROLE_HOME_ROUTES[user.role] || '/login';
    return <Navigate to={roleHome} replace />;
  }

  return children;
};
