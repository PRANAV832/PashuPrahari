/**
 * Authentication Service Boundary
 * 
 * Clean abstraction layer for authentication and role-based session management.
 * Connects to backend endpoints: POST /api/auth/request-otp & POST /api/auth/verify-otp.
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  FARMER: 'FARMER',
  VETERINARIAN: 'VETERINARIAN',
};

export const ROLE_HOME_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.FARMER]: '/farmer/report',
  [USER_ROLES.VETERINARIAN]: '/veterinarian/dashboard',
};

export const getHomeRouteForRole = (role) => {
  return ROLE_HOME_ROUTES[role] || '/login';
};

const STORAGE_KEY_USER = 'pashuprahari_user';
const STORAGE_KEY_TOKEN = 'pashuprahari_token';
const STORAGE_KEY_PENDING_PHONE = 'pashuprahari_pending_phone';
export const STORAGE_KEY_FARMER_LANG = 'pashuprahari_farmer_lang';
export const STORAGE_KEY_PENDING_FARMER_LANG = 'pashuprahari_pending_farmer_lang';

export const DEMO_OTP = '123456';

/**
 * Validate 10-digit Indian phone number
 */
export const validatePhoneNumber = (phone) => {
  const cleaned = (phone || '').replace(/\D/g, '');
  if (!cleaned) {
    return { isValid: false, error: 'Mobile number is required' };
  }
  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
  }
  if (!/^[6-9]/.test(cleaned)) {
    return { isValid: false, error: 'Mobile number must start with 6, 7, 8, or 9' };
  }
  return { isValid: true, error: null, cleaned };
};

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';

export const authService = {
  async requestOtp(phone) {
    const { isValid, error, cleaned } = validatePhoneNumber(phone);
    if (!isValid) {
      return Promise.reject(new Error(error));
    }

    sessionStorage.setItem(STORAGE_KEY_PENDING_PHONE, cleaned);

    const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleaned }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return data;
    } else {
      throw new Error(data.message || 'Mobile number is not registered with PashuPrahari.');
    }
  },

  async verifyOtp(phone, otp) {
    const cleaned = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      return Promise.reject(new Error('Please enter a valid 6-digit OTP'));
    }

    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleaned, otp: cleanOtp }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const pendingLang = sessionStorage.getItem(STORAGE_KEY_PENDING_FARMER_LANG) || 'en';
      const userPayload = { ...data.user };

      if (userPayload.role === USER_ROLES.FARMER) {
        userPayload.language = pendingLang;
        localStorage.setItem(STORAGE_KEY_FARMER_LANG, pendingLang);
      } else {
        localStorage.removeItem(STORAGE_KEY_FARMER_LANG);
      }

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userPayload));
      if (data.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      }
      sessionStorage.removeItem(STORAGE_KEY_PENDING_PHONE);
      sessionStorage.removeItem(STORAGE_KEY_PENDING_FARMER_LANG);
      return { ...data, user: userPayload };
    } else {
      throw new Error(data.message || 'Invalid OTP. Please try again.');
    }
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
  },

  getPendingPhone() {
    return sessionStorage.getItem(STORAGE_KEY_PENDING_PHONE) || '';
  },

  clearPendingPhone() {
    sessionStorage.removeItem(STORAGE_KEY_PENDING_PHONE);
    sessionStorage.removeItem(STORAGE_KEY_PENDING_FARMER_LANG);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_FARMER_LANG);
    sessionStorage.removeItem(STORAGE_KEY_PENDING_PHONE);
    sessionStorage.removeItem(STORAGE_KEY_PENDING_FARMER_LANG);
  },

  isAuthenticated() {
    return Boolean(this.getCurrentUser());
  },
};
