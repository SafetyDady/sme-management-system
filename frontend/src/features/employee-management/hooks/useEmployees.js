import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { employeeAPI } from '../../../lib/api.js';
import { toast } from 'sonner';
import { normalizeRole, canManageEmployees } from '../utils/roleUtils.js';

export const useEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('🔍 EmployeeManagement: Starting fetch employees...');
      console.log('🔍 Current user:', user);
      console.log('🔍 User role:', user?.role);
      
      // Check if user has permission to access employee management
      const normalizedRole = normalizeRole(user?.role);
      console.log('🔍 Normalized role:', normalizedRole);
      
      // Allow HR and admin role access
      if (!user || !canManageEmployees(user.role)) {
        console.warn('⚠️ User does not have permission to view employees. Role:', user?.role);
        toast.error('You need appropriate access to view employees');
        setEmployees([]);
        return;
      }
      
      console.log('🔍 Calling employeeAPI.getEmployees()...');
      const response = await employeeAPI.getEmployees();
      console.log('📥 Raw API Response:', response);
      
      // Handle different response formats
      let employeeData;
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          employeeData = response;
          console.log('✅ Direct array format');
        } else if (response.employees && Array.isArray(response.employees)) {
          employeeData = response.employees;
          console.log('✅ Nested employees array format');
        } else if (response.data && Array.isArray(response.data)) {
          employeeData = response.data;
          console.log('✅ Nested data array format');
        } else {
          console.error('❌ Invalid employees data format:', response);
          toast.error('Invalid data format received from server');
          setEmployees([]);
          return;
        }
      } else {
        console.error('❌ Invalid response format:', response);
        toast.error('Invalid response from server');
        setEmployees([]);
        return;
      }

      console.log('✅ Setting employees data:', employeeData);
      setEmployees(employeeData);
      
    } catch (error) {
      console.error('❌ Failed to fetch employees:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load employees';
      toast.error(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new employee
  const createEmployee = async (employeeData) => {
    try {
      setSubmitting(true);
      console.log('📝 Creating employee:', employeeData);
      
      const response = await employeeAPI.createEmployee(employeeData);
      console.log('✅ Employee created:', response);
      
      toast.success(`Employee ${employeeData.first_name} ${employeeData.last_name} created successfully!`);
      
      // Refresh the employee list
      await fetchEmployees();
      
      return { success: true, employee: response };
    } catch (error) {
      console.error('❌ Failed to create employee:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create employee';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Update employee
  const updateEmployee = async (employeeId, employeeData) => {
    try {
      setSubmitting(true);
      console.log('🔄 Updating employee:', employeeId, employeeData);
      
      const response = await employeeAPI.updateEmployee(employeeId, employeeData);
      console.log('✅ Employee updated:', response);
      
      toast.success(`Employee updated successfully!`);
      
      // Refresh the employee list
      await fetchEmployees();
      
      return { success: true, employee: response };
    } catch (error) {
      console.error('❌ Failed to update employee:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update employee';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Delete employee
  const deleteEmployee = async (employeeId) => {
    try {
      setSubmitting(true);
      console.log('🗑️ Deleting employee:', employeeId);
      
      await employeeAPI.deleteEmployee(employeeId);
      console.log('✅ Employee deleted');
      
      toast.success('Employee deleted successfully!');
      
      // Refresh the employee list
      await fetchEmployees();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete employee:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete employee';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle employee status
  const toggleEmployeeStatus = async (employeeId, isActive) => {
    try {
      setSubmitting(true);
      console.log('🔄 Toggling employee status:', employeeId, 'to:', isActive);
      
      const response = await employeeAPI.toggleEmployeeStatus(employeeId, isActive);
      console.log('✅ Employee status toggled:', response);
      
      toast.success(`Employee ${isActive ? 'activated' : 'deactivated'} successfully!`);
      
      // Refresh the employee list
      await fetchEmployees();
      
      return { success: true, employee: response };
    } catch (error) {
      console.error('❌ Failed to toggle employee status:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to toggle employee status';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Load employees on mount and user change
  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  return {
    employees,
    loading,
    submitting,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus
  };
};
