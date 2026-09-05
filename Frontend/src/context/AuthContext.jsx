import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, USER_ROLES, ROLE_HOME_ROUTES } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const existing = authService.getCurrentUser();
    if (existing) {
      setUser(existing);
    }
  }, []);

  const loginWithOtp = async (phone, otp) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(phone, otp);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchRole = (newRole) => {
    const updated = authService.switchRole(newRole);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        loginWithOtp,
        logout,
        switchRole,
        setUser,
        USER_ROLES,
        ROLE_HOME_ROUTES,
      }}
    >
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
