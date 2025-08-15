// API service for Employee Management
const API_BASE = 'http://localhost:8000/api';

class EmployeeService {
  // Get auth token from cookies (same as auth system)
  getAuthHeaders() {
    // Read auth_token from cookies using vanilla JS
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    const token = getCookie('auth_token');
    console.log('🔑 Employee Service - Token found:', !!token);
    
    if (!token) {
      throw new Error('ไม่พบ authentication token กรุณาเข้าสู่ระบบใหม่');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all employees with optional filters
  async getEmployees(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.department) params.append('department', filters.department);
    if (filters.active !== undefined) params.append('active', filters.active);
    if (filters.search) params.append('q', filters.search);
    
    const url = `${API_BASE}/employees/${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      redirect: 'follow' // Handle redirects automatically
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Get single employee by ID
  async getEmployee(employeeId) {
    const response = await fetch(`${API_BASE}/employees/${employeeId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Create new employee
  async createEmployee(employeeData) {
    const response = await fetch(`${API_BASE}/employees/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to create employee: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Update employee
  async updateEmployee(employeeId, employeeData) {
    const response = await fetch(`${API_BASE}/employees/${employeeId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to update employee: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Delete employee
  async deleteEmployee(employeeId) {
    const response = await fetch(`${API_BASE}/employees/${employeeId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to delete employee: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

export const employeeService = new EmployeeService();
