import { useState, useCallback } from 'react';
import { getToken } from '../lib/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useHR = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get authentication headers
  const getHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all employees
  const fetchEmployees = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${API_BASE_URL}/api/employees/`;
      
      // Add filters as query parameters
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.search) params.append('search', filters.search);
      if (filters.active_only !== undefined) params.append('active_only', filters.active_only);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new employee
  const createEmployee = useCallback(async (employeeData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(employeeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const newEmployee = await response.json();
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      console.error('Failed to create employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update employee
  const updateEmployee = useCallback(async (employeeId, employeeData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(employeeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedEmployee = await response.json();
      setEmployees(prev => 
        prev.map(emp => emp.employee_id === employeeId ? updatedEmployee : emp)
      );
      return updatedEmployee;
    } catch (err) {
      console.error('Failed to update employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete employee
  const deleteEmployee = useCallback(async (employeeId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      setEmployees(prev => prev.filter(emp => emp.employee_id !== employeeId));
      return true;
    } catch (err) {
      console.error('Failed to delete employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get employee by ID
  const getEmployee = useCallback(async (employeeId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const employee = await response.json();
      return employee;
    } catch (err) {
      console.error('Failed to fetch employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee
  };
};

export default useHR;
