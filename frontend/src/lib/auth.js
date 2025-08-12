import Cookies from 'js-cookie';

// Inline role configuration to avoid import issues
const ROLES_CONFIG = {
  "roles": {
    "superadmin": { "name": "Super Admin", "level": 4, "permissions": ["*"] },
    "admin": { 
      "name": "Admin", 
      "level": 3,
      "permissions": [
        "user.view", "user.create", "user.edit", "user.delete",
        "employee.view", "employee.create", "employee.edit", "employee.delete",
        "hr.leave.view", "hr.leave.approve", "system.settings.view"
      ]
    },
    "hr": {
      "name": "HR Manager", "level": 2,
      "permissions": [
        "employee.view", "employee.create", "employee.edit", "employee.delete",
        "user.view", "user.create", "user.edit",
        "hr.leave.view", "hr.leave.create", "hr.leave.edit", "hr.leave.approve",
        "hr.daily.view", "hr.daily.approve", "hr.reports.view"
      ]
    },
    "user": {
      "name": "Employee", "level": 1,
      "permissions": ["profile.view", "profile.edit", "hr.leave.view", "hr.leave.create", "hr.daily.view", "hr.daily.create"]
    }
  },
  "role_mapping": {
    "superadmin": "superadmin", "admin1": "admin", "admin2": "admin", 
    "hr": "hr", "user": "user", "employee": "user"
  }
};

// Inline permission functions
const normalizeRole = (rawRole) => ROLES_CONFIG.role_mapping[rawRole] || "user";
const getRolePermissions = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLES_CONFIG.roles[normalizedRole]?.permissions || [];
};
const checkPermission = (userRole, requiredPermission) => {
  const permissions = getRolePermissions(userRole);
  if (permissions.includes("*")) return true;
  if (permissions.includes(requiredPermission)) return true;
  for (const permission of permissions) {
    if (permission.endsWith(".*")) {
      const prefix = permission.slice(0, -2);
      if (requiredPermission.startsWith(prefix + ".")) return true;
    }
  }
  return false;
};
const getRoleLevel = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLES_CONFIG.roles[normalizedRole]?.level || 0;
};
const canAccessRole = (userRole, requiredRole) => {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  return userLevel >= requiredLevel;
};
const can = (userRole, permissionOrRole) => {
  if (permissionOrRole.includes('.')) {
    return checkPermission(userRole, permissionOrRole);
  }
  return canAccessRole(userRole, permissionOrRole);
};
const checkRole = (userData, requiredRoles) => {
  if (!userData || !userData.role) return false;
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const userRole = normalizeRole(userData.role);
  return roles.some(role => canAccessRole(userRole, role));
};

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

// Unified permission checking - wrapper for the inline function
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

