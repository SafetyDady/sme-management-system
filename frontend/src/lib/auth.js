import Cookies from 'js-cookie';
import { normalizeRole, hasRole as checkRole, can } from '@/lib/permissions';

// Token management
export const getToken = () => {
  return Cookies.get('auth_token');
};

export const setToken = (token) => {
  // Set cookie with 1 hour expiry (same as JWT)
  Cookies.set('auth_token', token, { expires: 1/24 });
};

export const removeToken = () => {
  Cookies.remove('auth_token');
};

// User data management
export const getUserData = () => {
  const userData = Cookies.get('user_data');
  if (!userData) return null;
  
  const user = JSON.parse(userData);
  // Always normalize role when retrieving user data
  if (user.role) {
    user.role = normalizeRole(user.role);
  }
  return user;
};

export const setUserData = (userData) => {
  // Normalize role before storing
  if (userData.role) {
    userData.role = normalizeRole(userData.role);
  }
  Cookies.set('user_data', JSON.stringify(userData), { expires: 1/24 });
};

export const removeUserData = () => {
  Cookies.remove('user_data');
};

// Authentication checks
export const isAuthenticated = () => {
  const token = getToken();
  const userData = getUserData();
  return !!(token && userData);
};

// Unified permission checking
export const hasPermission = (permission) => {
  const user = getUserData();
  return user ? can(user.role, permission) : false;
};

// Role checking (legacy support + new unified approach)
export const hasRole = (userData, requiredRoles) => {
  // Handle new usage: hasRole(user, roles) 
  if (userData && typeof userData === 'object' && userData.role) {
    return checkRole(userData, requiredRoles);
  }
  
  // Handle legacy usage: hasRole('admin')
  const user = getUserData();
  return user ? checkRole(user, userData) : false;
};

export const canManageUser = (targetUser) => {
  const currentUser = getUserData();
  if (!currentUser || !targetUser) return false;
  
  // Use permission-based checking instead of role hierarchy
  return hasPermission('user.edit');
};

export const getRedirectPath = (role) => {
  const normalizedRole = normalizeRole(role);
  console.log('🔀 Redirect path for role:', { originalRole: role, normalizedRole });
  
  switch (normalizedRole) {
    case 'superadmin':
      console.log('➡️ Redirecting superadmin to /dashboard');
      return '/dashboard';
    case 'admin':
      console.log('➡️ Redirecting admin to /dashboard');
      return '/dashboard';
    case 'hr':
      console.log('➡️ Redirecting hr to /hr');
      return '/hr';  // Direct to HR dashboard
    case 'user':
      console.log('➡️ Redirecting user to /dashboard');
      return '/dashboard';
    default:
      console.log('➡️ Unknown role, redirecting to /login');
      return '/login';
  }
};

// Clear all auth data
export const clearAuthData = () => {
  removeToken();
  removeUserData();
};

