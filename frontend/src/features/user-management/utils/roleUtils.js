// Role utility functions for user management
export const normalizeRole = (role) => {
  const roleMapping = {
    'employee': 'user'
  };
  return roleMapping[role] || role;
};

// Role display names for better UX
export const getRoleDisplayName = (role) => {
  const displayNames = {
    'superadmin': 'Super Admin',
    'admin': 'Administrator',
    'hr': 'HR Manager',
    'user': 'User'
  };
  return displayNames[role] || role;
};

// Role icon mapping
export const getRoleIcon = (role) => {
  const roleIcons = {
    'superadmin': '👑',
    'director': '🎯',
    'admin': '⚡',
    'manager': '📊',
    'hr': '👥',
    'supervisor': '🔍',
    'engineer': '🔧',
    'purchasing': '🛒',
    'store': '📦',
    'accounting': '💰',
    'employee': '👤',
    'client': '🤝'
  };
  return roleIcons[role] || '👤';
};

// Role color mapping for badges
export const getRoleColor = (role) => {
  const roleColors = {
    'superadmin': 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
    'director': 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
    'admin': 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
    'manager': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    'hr': 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
    'supervisor': 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
    'engineer': 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    'purchasing': 'bg-gradient-to-r from-teal-500 to-green-600 text-white',
    'store': 'bg-gradient-to-r from-orange-500 to-red-600 text-white',
    'accounting': 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
    'employee': 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
    'client': 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};

// All available roles
export const AVAILABLE_ROLES = [
  'user',      // แทน employee
  'hr',
  'admin',
  'superadmin'
];

// Permission checks
export const canManageUsers = (userRole) => {
  const managerRoles = ['superadmin', 'director', 'admin', 'hr'];
  return managerRoles.includes(userRole);
};

export const canEditRole = (currentUserRole, targetUserRole) => {
  // SuperAdmin can edit anyone
  if (currentUserRole === 'superadmin') return true;
  
  // Director can edit everyone except superadmin
  if (currentUserRole === 'director' && targetUserRole !== 'superadmin') return true;
  
  // Admin can edit manager and below
  const adminCanEdit = ['manager', 'hr', 'supervisor', 'engineer', 'purchasing', 'store', 'accounting', 'employee', 'client'];
  if (currentUserRole === 'admin' && adminCanEdit.includes(targetUserRole)) return true;
  
  // HR can edit supervisor and below
  const hrCanEdit = ['supervisor', 'engineer', 'purchasing', 'store', 'accounting', 'employee', 'client'];
  if (currentUserRole === 'hr' && hrCanEdit.includes(targetUserRole)) return true;
  
  return false;
};
