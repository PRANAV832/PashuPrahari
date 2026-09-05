import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = authService.getToken();
  const user = authService.getCurrentUser();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user?.id || user?._id) {
    headers['x-user-id'] = user.id || user._id;
  }
  return headers;
};

export const userService = {
  /**
   * Retrieve all active registered veterinarians for assignment
   */
  async getVeterinarians() {
    try {
      const res = await fetch(`${API_BASE_URL}/users/vets`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.veterinarians)) {
        return data.veterinarians;
      }
      throw new Error(data.message || 'Failed to fetch veterinarians');
    } catch (err) {
      console.warn('userService.getVeterinarians error:', err.message);
      return [];
    }
  },

  /**
   * Retrieve all users with optional filters (role, status, search)
   */
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const res = await fetch(`${API_BASE_URL}/users${qs}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.users)) {
        return data.users;
      }
      throw new Error(data.message || 'Failed to fetch users');
    } catch (err) {
      console.warn('userService.getUsers error:', err.message);
      return [];
    }
  },

  /**
   * Register a new user (Farmer, Veterinarian, or Admin)
   */
  async registerUser(userData) {
    const res = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.user;
    }
    throw new Error(data.message || 'Failed to register user');
  },

  /**
   * Update account status of a user (ACTIVE, SUSPENDED, REVOKED)
   */
  async updateUserStatus(userId, status) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.user;
    }
    throw new Error(data.message || 'Failed to update user status');
  },
};
