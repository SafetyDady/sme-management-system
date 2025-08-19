// Role utility functions for user management
export const normalizeRole = (role) => {
  const roleMapping = {
    'employee': 'user'
  };
  return roleMapping[role] || role;
};

// Role display names for better UX (synced with shared_config/roles.json)
export const getRoleDisplayName = (role) => {
  const displayNames = {
    'superadmin': 'Super Admin',
    'director': 'Director',
    'system_admin': 'System Admin',
    'admin': 'Administrator',
    'manager': 'Manager',
    'hr': 'HR Manager',
    'supervisor': 'Supervisor',
    'engineer': 'Engineer',
    'purchasing': 'Purchasing',
    'store': 'Store',
    'employee': 'Employee',
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

// Role color mapping for badges (synced with shared_config/roles.json)
export const getRoleColor = (role) => {
  const roleColors = {
    'superadmin': 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
    'director': 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
    'system_admin': 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white',
    'admin': 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
    'manager': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    'hr': 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
    'supervisor': 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
    'engineer': 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    'purchasing': 'bg-gradient-to-r from-teal-500 to-green-600 text-white',
    'store': 'bg-gradient-to-r from-orange-500 to-red-600 text-white',
    'employee': 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
    'user': 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};

// All available roles (synced with shared_config/roles.json)
export const AVAILABLE_ROLES = [
  'user',           // แทน employee
  'employee',       // Original employee role
  'engineer',
  'purchasing', 
  'store',
  'hr',
  'supervisor',
  'manager',
  'admin',
  'system_admin',
  'director',
  'superadmin'
];

// Permission checks
export const canManageUsers = (userRole) => {
  const managerRoles = ['superadmin', 'director', 'admin', 'hr'];
  return managerRoles.includes(userRole);
};

export const canEditRole = (currentUserRole, targetUserRole) => {
  // Role hierarchy (based on shared_config/roles.json levels)
  const roleHierarchy = {
    'superadmin': 5,
    'director': 4,
    'system_admin': 4,
    'admin': 3,
    'manager': 3,
    'hr': 2,
    'supervisor': 2,
    'engineer': 1,
    'purchasing': 1,
    'store': 1,
    'employee': 1,
    'user': 1
  };
  
  const currentLevel = roleHierarchy[currentUserRole] || 0;
  const targetLevel = roleHierarchy[targetUserRole] || 0;
  
  // Can edit roles at same level or below, but not superadmin (except by superadmin)
  if (targetUserRole === 'superadmin' && currentUserRole !== 'superadmin') {
    return false;
  }
  
  return currentLevel >= targetLevel;
};
