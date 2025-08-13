// Employee Department Constants
export const AVAILABLE_DEPARTMENTS = [
  'hr',
  'it',
  'finance', 
  'marketing',
  'sales',
  'operations',
  'engineering',
  'design',
  'customer_service',
  'legal'
];

// Employment Type Constants  
export const AVAILABLE_EMPLOYMENT_TYPES = [
  'full_time',
  'part_time', 
  'contract',
  'intern',
  'consultant'
];

// Department Display Names
export const getDepartmentDisplayName = (department) => {
  const names = {
    hr: 'Human Resources',
    it: 'Information Technology',
    finance: 'Finance', 
    marketing: 'Marketing',
    sales: 'Sales',
    operations: 'Operations',
    engineering: 'Engineering',
    design: 'Design',
    customer_service: 'Customer Service',
    legal: 'Legal'
  };
  return names[department] || department?.charAt(0).toUpperCase() + department?.slice(1) || 'Unknown';
};

// Employment Type Display Names
export const getEmploymentTypeDisplayName = (type) => {
  const names = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    intern: 'Intern',
    consultant: 'Consultant'
  };
  return names[type] || type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown';
};

// Department Color Schemes
export const getDepartmentColor = (department) => {
  const colors = {
    hr: 'bg-green-100 text-green-800 border-green-200',
    it: 'bg-blue-100 text-blue-800 border-blue-200',
    finance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    marketing: 'bg-pink-100 text-pink-800 border-pink-200',
    sales: 'bg-purple-100 text-purple-800 border-purple-200',
    operations: 'bg-orange-100 text-orange-800 border-orange-200',
    engineering: 'bg-gray-100 text-gray-800 border-gray-200',
    design: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    customer_service: 'bg-teal-100 text-teal-800 border-teal-200',
    legal: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[department] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Employment Type Color Schemes
export const getEmploymentTypeColor = (type) => {
  const colors = {
    full_time: 'bg-green-100 text-green-800 border-green-200',
    part_time: 'bg-blue-100 text-blue-800 border-blue-200',
    contract: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    intern: 'bg-purple-100 text-purple-800 border-purple-200',
    consultant: 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Role normalization
export const normalizeRole = (role) => {
  if (!role) return 'user';
  return role.toLowerCase();
};

// Employee Management Permissions
export const canCreateEmployee = (userRole) => {
  return ['hr', 'admin', 'superadmin'].includes(userRole);
};

export const canEditEmployee = (userRole) => {
  return ['hr', 'admin', 'superadmin'].includes(userRole);
};

export const canDeleteEmployee = (userRole) => {
  return ['hr', 'admin', 'superadmin'].includes(userRole);
};

export const canToggleEmployeeStatus = (userRole) => {
  return ['hr', 'admin', 'superadmin'].includes(userRole);
};

export const canViewEmployeeDetails = (userRole) => {
  return ['hr', 'admin', 'superadmin'].includes(userRole);
};

export const canManageEmployees = (userRole) => {
  return ['hr', 'admin', 'superadmin'].includes(userRole);
};

// Employee filters
export const getEmployeeFilterOptions = () => {
  return {
    departments: AVAILABLE_DEPARTMENTS.map(dept => ({
      value: dept,
      label: getDepartmentDisplayName(dept)
    })),
    employmentTypes: AVAILABLE_EMPLOYMENT_TYPES.map(type => ({
      value: type,
      label: getEmploymentTypeDisplayName(type)
    })),
    statuses: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  };
};

// Sort options for employees
export const getEmployeeSortOptions = () => {
  return [
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'department', label: 'Department' },
    { value: 'position', label: 'Position' },
    { value: 'hire_date', label: 'Hire Date' },
    { value: 'created', label: 'Created Date' }
  ];
};
