import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// API Configuration - แก้ปัญหา CORS ใน Railway
const getApiBaseURL = () => {
  // Development mode - use empty string to work with Vite proxy
  if (import.meta.env.DEV) {
    return ''; // Let Vite proxy handle /api/* routes
  }
  
  // Production mode - Railway Proxy Mode
  if (window.location.hostname.includes('railway.app') || 
      process.env.NODE_ENV === 'production') {
    return '/api'; // Uses Railway proxy at /api/*
  }
  
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseURL();

// Minimal logging in production
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    env: import.meta.env.VITE_ENV || 'development'
  });
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Disable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    
    // Minimal logging in development only
    if (import.meta.env.DEV) {
      console.log('🔍 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    return config;
  },
  (error) => {
    console.error('🚨 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Minimal success logging in development only
    if (import.meta.env.DEV) {
      console.log('✅ API Success:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Always log errors but less verbose in production
    const logLevel = import.meta.env.DEV ? 'detailed' : 'minimal';
    
    if (logLevel === 'detailed') {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    } else {
      console.error('❌ API Error:', error.response?.status, error.config?.url);
    }
    
    // Handle CORS and network errors
    if (!error.response && (error.code === 'NETWORK_ERROR' || error.message.includes('CORS'))) {
      console.error('🚫 CORS or Network Error detected');
      toast.error('Connection failed. Please check if the API server is running.');
      return Promise.reject({
        message: 'Network connection failed. Please try again later.',
        type: 'NETWORK_ERROR'
      });
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission.');
    } else if (error.response?.status === 429) {
      // Rate limiting - wait and retry
      console.warn('⚠️ Rate limited - cooling down...');
      toast.warn('Too many requests. Please wait a moment.');
      // Add exponential backoff for retries
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(error);
        }, 2000); // Wait 2 seconds before allowing retry
      });
    } else if (error.response?.status >= 500) {
      // Backend JSON serialization error หรือ server errors อื่นๆ
      console.error('🔥 Backend Server Error:', error.response?.data);
      toast.error('Backend server error. The development team has been notified.');
    } else if (error.response?.status === 422) {
      // Validation error - อาจมีปัญหากับ JSON serialization
      console.error('📝 Validation Error:', error.response?.data);
      const errorMsg = typeof error.response?.data === 'string' 
        ? error.response.data 
        : 'Please check your input data.';
      toast.error(`Validation Error: ${errorMsg}`);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      // ใช้ /api/login เพื่อให้ตรงกับ backend endpoint
      const response = await api.post('/api/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      // ใช้ /api/me เพื่อให้ตรงกับ backend endpoint  
      const response = await api.get('/api/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    window.location.href = '/login';
  },

  // Forgot Password functionality
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('✅ Forgot password request sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  },

  verifyResetToken: async (token) => {
    try {
      const response = await api.get(`/auth/verify-reset-token?token=${token}`);
      console.log('✅ Reset token verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Token verification error:', error);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        new_password: newPassword 
      });
      console.log('✅ Password reset successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  }
};

// System API
export const systemAPI = {
  getHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDashboard: async () => {
    try {
      console.log('🌐 Making API call to /dashboard...');
      console.log('API Base URL:', API_BASE_URL);
      const response = await api.get('/dashboard');
      console.log('✅ Dashboard API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Dashboard API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // If dashboard endpoint fails, return minimal data
      if (error.response?.status === 404) {
        console.log('📝 Dashboard endpoint not found, returning fallback');
        return {
          message: 'Dashboard endpoint not available',
          role: 'unknown',
          access_level: 'basic'
        };
      }
      throw error;
    }
  }
};

// User Management API
export const userAPI = {
  getUsers: async () => {
    console.log('🔍 Calling userAPI.getUsers()...');
    try {
      const response = await api.get('/api/users/');
      console.log('✅ Users API Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Users API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  createUser: async (userData) => {
    console.log('🔍 Creating user with data:', userData);
    
    // Ensure required fields are present - ย้ายออกมานอก try block
    const cleanUserData = {
      username: userData.username?.trim(),
      email: userData.email?.trim()?.toLowerCase(),
      password: userData.password,
      role: userData.role || 'user',
      is_active: userData.is_active !== undefined ? userData.is_active : true
    };
    
    console.log('🔍 Clean user data:', cleanUserData);
    
    try {
      const response = await api.post('/api/users/', cleanUserData);
      console.log('✅ Create user success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create user error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    console.log('🔍 Updating user:', userId, userData);
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      console.log('✅ Update user success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    console.log('🔍 Deleting user:', userId);
    try {
      const response = await api.delete(`/api/users/${userId}`);
      console.log('✅ Delete user success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete user error:', error);
      throw error;
    }
  },

  toggleUserStatus: async (userId, isActive) => {
    console.log('🔍 Toggling user status:', userId, isActive);
    try {
      const response = await api.patch(`/api/users/${userId}/status`, { is_active: isActive });
      console.log('✅ Toggle status success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Toggle status error:', error);
      throw error;
    }
  },

  getUserProfile: async () => {
    console.log('🔍 Getting current user profile...');
    try {
      const response = await api.get('/api/users/me');
      console.log('✅ Get profile success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    console.log('🔍 Updating profile:', userData);
    try {
      const response = await api.put('/api/users/me', userData);
      console.log('✅ Update profile success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    console.log('🔍 Changing password...');
    try {
      const response = await api.post('/api/users/me/change-password', passwordData);
      console.log('✅ Change password success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }
};

// Connection check utility
export const connectionCheck = {
  // Check if backend is reachable
  checkBackendHealth: async () => {
    try {
      // Try a simple GET request to a known endpoint
      // Using a lightweight endpoint or just test the base URL
      const response = await api.get('/', { timeout: 5000 });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Backend health check failed:', error.message);
      
      // If it's a 404, the server is actually responding
      if (error.response?.status === 404) {
        return { success: true, data: 'Server is responding' };
      }
      
      return { 
        success: false, 
        error: error.message,
        isTimeout: error.code === 'ECONNABORTED'
      };
    }
  },

  // Switch to Railway if local server is down
  switchToRailway: () => {
    const railwayURL = import.meta.env.VITE_RAILWAY_API_URL || 'https://web-production-5b6ab.up.railway.app';
    api.defaults.baseURL = railwayURL;
    console.log('Switched to Railway backend:', railwayURL);
    toast.info('Switched to Railway backend server');
  },

  // Switch back to local development server
  switchToLocal: () => {
    if (import.meta.env.DEV) {
      api.defaults.baseURL = '/api';
      console.log('Switched to local development server');
      toast.info('Connected to local development server');
    }
  },
};

export default api;

// Named export for compatibility
export { api };

