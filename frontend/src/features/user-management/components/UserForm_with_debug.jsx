import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AVAILABLE_ROLES, getRoleDisplayName, getRoleIcon, canEditRole } from '../utils/roleUtils.js';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { getToken } from '../../../lib/auth.js';

const UserForm = ({ user, onSubmit, onCancel, submitting }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',  // เปลี่ยนจาก employee เป็น user
    employee_id: null  // เพิ่ม employee_id
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Initialize form data when user prop changes
  useEffect(() => {
    console.log('� useEffect triggered - Form Initialization', {
      user,
      hasUser: !!user,
      userRole: user?.role,
      userEmployeeId: user?.employee_id,
      availableEmployeesCount: availableEmployees.length,
      availableRolesCount: AVAILABLE_ROLES.length
    });
    
    if (user) {
      const newFormData = {
        username: user.username || '',
        email: user.email || '',
        password: '', // Never pre-fill password
        role: user.role || 'user', // แก้ไขให้ใช้ 'user' เป็นค่า default ที่สอดคล้องกัน
        employee_id: user.employee_id || null
      };
      console.log('✅ EDIT MODE - Setting form data:', newFormData);
      console.log('🎯 Role validation - Is role in AVAILABLE_ROLES?', 
        AVAILABLE_ROLES.includes(user.role || 'user'));
      setFormData(newFormData);
    } else {
      const newFormData = {
        username: '',
        email: '',
        password: '',
        role: 'user',  // เปลี่ยนจาก employee เป็น user
        employee_id: null
      };
      console.log('✅ CREATE MODE - Setting form data:', newFormData);
      setFormData(newFormData);
    }
    setErrors({});
  }, [user, availableEmployees]); // เพิ่ม availableEmployees ใน dependency

  // Load unassigned employees for admin roles and above
  useEffect(() => {
    const fetchUnassignedEmployees = async () => {
      // Allow admin, system_admin, and superadmin to manage employee assignments
      if (currentUser?.role === 'admin' || currentUser?.role === 'system_admin' || currentUser?.role === 'superadmin') {
        setLoadingEmployees(true);
        try {
          const response = await fetch('/api/users/employees/unassigned', {
            headers: {
              'Authorization': `Bearer ${getToken()}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const employees = await response.json();
            
            // If user has assigned employee, fetch that employee's details
            let employeeOptions = [...employees];
            console.log('📋 Available employees from API:', employees);
            if (user?.employee_id) {
              console.log('🔍 User has employee_id:', user.employee_id);
              
              // Find if current employee is in unassigned list
              const isCurrentInList = employees.find(emp => (emp.id || emp.employee_id) === user.employee_id);
              if (!isCurrentInList) {
                console.log('➕ Need to fetch current employee details');
                // Fetch current employee details
                try {
                  const empResponse = await fetch(`/api/employees/${user.employee_id}`, {
                    headers: {
                      'Authorization': `Bearer ${getToken()}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  if (empResponse.ok) {
                    const currentEmp = await empResponse.json();
                    console.log('🔍 Raw current employee data:', currentEmp);
                    const currentEmployee = {
                      id: currentEmp.employee_id || currentEmp.id,
                      employee_id: currentEmp.employee_id || currentEmp.id,
                      employee_code: currentEmp.emp_code || currentEmp.employee_code || `EMP${currentEmp.employee_id || currentEmp.id}`,
                      first_name: currentEmp.first_name || 'Unknown',
                      last_name: currentEmp.last_name || 'Employee',
                      department: currentEmp.department || null,
                      position: currentEmp.position || null,
                      is_current: true // Mark as current assignment
                    };
                    console.log('✅ Processed current employee:', currentEmployee);
                    employeeOptions = [currentEmployee, ...employees];
                  } else {
                    console.error('❌ Failed to fetch employee details, status:', empResponse.status);
                    // Fallback: create a minimal current employee entry
                    const fallbackEmployee = {
                      id: user.employee_id,
                      employee_id: user.employee_id,
                      employee_code: `EMP${user.employee_id}`,
                      first_name: 'Current',
                      last_name: 'Employee',
                      department: null,
                      position: null,
                      is_current: true
                    };
                    console.log('🔄 Using fallback employee:', fallbackEmployee);
                    employeeOptions = [fallbackEmployee, ...employees];
                  }
                } catch (empError) {
                  console.error('❌ Error fetching current employee details:', empError);
                  // Fallback: create a minimal current employee entry
                  const fallbackEmployee = {
                    id: user.employee_id,
                    employee_id: user.employee_id,
                    employee_code: `EMP${user.employee_id}`,
                    first_name: 'Current',
                    last_name: 'Employee',
                    department: null,
                    position: null,
                    is_current: true
                  };
                  console.log('🔄 Using fallback employee (error):', fallbackEmployee);
                  employeeOptions = [fallbackEmployee, ...employees];
                }
              } else {
                console.log('✅ Current employee already in unassigned list');
                // Mark the current employee as current in the existing list
                const currentEmployeeInList = employeeOptions.find(emp => (emp.id || emp.employee_id) === user.employee_id);
                if (currentEmployeeInList) {
                  currentEmployeeInList.is_current = true;
                }
              }
            }
            console.log('📝 Final employee options:', employeeOptions);
            setAvailableEmployees(employeeOptions);
          } else {
            console.error('Failed to fetch employees');
            setAvailableEmployees([]);
          }
        } catch (error) {
          console.error('Error loading employees:', error);
          setAvailableEmployees([]);
        } finally {
          setLoadingEmployees(false);
        }
      }
    };

    fetchUnassignedEmployees();
  }, [currentUser?.role, user?.employee_id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 8) {  // เปลี่ยนจาก 6 เป็น 8
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare submit data (exclude password if empty for updates)
    const submitData = { ...formData };
    if (user && !submitData.password) {
      delete submitData.password;
    }
    
    // Debug log
    console.log('🔍 UserForm submitting data:', submitData);
    
    onSubmit(submitData);
  };

  // Filter available roles based on current user's permissions
  const getAvailableRoles = () => {
    return AVAILABLE_ROLES.filter(role => 
      canEditRole(currentUser?.role, role)
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Enter username"
          className={errors.username ? 'border-red-500' : ''}
          disabled={submitting}
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter email address"
          className={errors.email ? 'border-red-500' : ''}
          disabled={submitting}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password {user ? '(leave blank to keep current)' : ''}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder={user ? "Enter new password" : "Enter password"}
            className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
            disabled={submitting}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={submitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Employee Assignment - Only for SystemAdmin and SuperAdmin */}
      {(currentUser?.role === 'system_admin' || currentUser?.role === 'superadmin') && (
        <div className="space-y-2">
          <Label htmlFor="employee_id">Assign Employee (Optional)</Label>
          <Select 
            value={formData.employee_id ? formData.employee_id.toString() : 'none'} 
            onValueChange={(value) => {
              console.log('👥 Employee changed to:', value);
              handleInputChange('employee_id', value === 'none' ? null : parseInt(value));
            }}
            disabled={submitting || loadingEmployees}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center space-x-2">
                  <span>No Employee Assignment</span>
                </div>
              </SelectItem>
              {availableEmployees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  <div className="flex items-center space-x-2">
                    {employee.is_current && <span className="text-green-500">●</span>}
                    <span className={employee.is_current ? "text-green-600 font-medium" : ""}>
                      {employee.employee_code} - {employee.first_name} {employee.last_name}
                      {employee.is_current && " (Current)"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingEmployees && (
            <p className="text-sm text-gray-500">Loading available employees...</p>
          )}
          {/* DEBUG: Show current employee state */}
          <div className="text-xs text-gray-500">
            DEBUG - Employee ID: {formData.employee_id} | Available: {availableEmployees.length} employees
          </div>
        </div>
      )}

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={formData.role || ""} 
          onValueChange={(value) => {
            console.log('🎭 Role changed to:', value);
            handleInputChange('role', value);
          }}
          disabled={submitting}
        >
          <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableRoles().map((role) => (
              <SelectItem key={role} value={role}>
                <div className="flex items-center space-x-2">
                  <span>{getRoleIcon(role)}</span>
                  <span>{getRoleDisplayName(role)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role}</p>
        )}
        {/* DEBUG: Show current role state */}
        <div className="text-xs text-gray-500">
          DEBUG - Current role: "{formData.role}" | Valid role: {AVAILABLE_ROLES.includes(formData.role) ? '✅' : '❌'}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
