import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { 
  getToken, 
  setToken, 
  getUserData, 
  setUserData, 
  clearAuthData, 
  isAuthenticated as checkAuth,
  getRedirectPath
} from '../lib/auth';
import { toast } from 'react-toastify';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUserData());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const userData = getUserData();

      console.log('🔐 Auth initialization:', { hasToken: !!token, hasUserData: !!userData });

      if (token && userData) {
        try {
          // Verify token with backend
          console.log('🔍 Verifying token with backend...');
          const currentUser = await authAPI.getCurrentUser();
          console.log('✅ Token valid, user authenticated:', currentUser);
          setUser(currentUser);
          setUserData(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear auth data
          console.log('❌ Token invalid, clearing auth data:', error.message);
          clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
          toast.error('Session expired. Please login again.');
        }
      } else {
        console.log('❌ No token/userData found, user not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
      console.log('🏁 Auth initialization complete');
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login with:', credentials.username);
      
      const response = await authAPI.login(credentials);
      const { access_token, user: userData } = response;
      
      console.log('✅ Login successful, user data:', userData);
      
      // Store token and user data
      setToken(access_token);
      setUserData(userData);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('💾 Auth data stored successfully');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function with enhanced security
  const logout = () => {
    console.log('🚪 Logging out user:', user?.username);
    
    // Clear all authentication data
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear browser history and cache to prevent back button abuse
    if (window.history.length > 1) {
      window.history.go(-(window.history.length - 1));
    }
    
    // Replace current history state
    window.history.replaceState(null, '', '/login');
    
    // Clear any cached pages
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Force page reload to clear any cached states
    toast.success('Logged out successfully');
    window.location.replace('/login');
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    setUserData(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

