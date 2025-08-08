import Cookies from 'js-cookie';

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
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (userData) => {
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

export const hasRole = (requiredRole) => {
  const userData = getUserData();
  if (!userData) {
    console.log('🔍 hasRole: No user data found');
    return false;
  }
  
  let userRole = userData.role;
  console.log('🔍 hasRole check:', { userRole, requiredRole, userData });
  
  // Fix for backend that returns username as role (admin1 -> admin)
  if (userRole === 'admin1' || userRole === 'admin2') {
    userRole = 'admin';
    console.log('🔄 Normalized role from', userData.role, 'to', userRole);
  }
  
  // Role hierarchy: superadmin > admin > user
  const roleHierarchy = {
    'superadmin': 3,
    'admin': 2,
    'user': 1
  };
  
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  const hasAccess = userLevel >= requiredLevel;
  console.log('🔍 Role check result:', { 
    originalRole: userData.role,
    normalizedRole: userRole,
    userLevel, 
    requiredLevel, 
    hasAccess
  });
  
  return hasAccess;
};

export const canManageUser = (targetUser) => {
  const currentUser = getUserData();
  if (!currentUser) return false;
  
  // Superadmin can manage everyone
  if (currentUser.role === 'superadmin') return true;
  
  // Admin can only manage users with 'user' role
  if (currentUser.role === 'admin') {
    return targetUser.role === 'user';
  }
  
  // Users can only manage themselves
  if (currentUser.role === 'user') {
    return currentUser.id === targetUser.id;
  }
  
  return false;
};

export const getRedirectPath = (role) => {
  // Normalize role first (admin1, admin2 -> admin)
  let normalizedRole = role;
  if (role === 'admin1' || role === 'admin2') {
    normalizedRole = 'admin';
  }
  
  console.log('🔀 Redirect path for role:', { originalRole: role, normalizedRole });
  
  switch (normalizedRole) {
    case 'superadmin':
      console.log('➡️ Redirecting superadmin to /dashboard');
      return '/dashboard';
    case 'admin':
      console.log('➡️ Redirecting admin to /dashboard');
      return '/dashboard';
    case 'user':
      console.log('➡️ Redirecting user to /profile');
      return '/dashboard'; // Changed to /dashboard for now since /profile doesn't exist
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

