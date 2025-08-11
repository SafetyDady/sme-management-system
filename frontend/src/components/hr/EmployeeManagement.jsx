import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  UserCheck,
  UserX
} from 'lucide-react';
import { api } from '@/lib/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    department: '',
    employment_type: 'Full-time',
    is_active: true
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hr/employees');
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to load employees');
      console.error('Employee fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/hr/employees', formData);
      setShowAddForm(false);
      setFormData({
        username: '',
        email: '',
        full_name: '',
        phone: '',
        department: '',
        employment_type: 'Full-time',
        is_active: true
      });
      fetchEmployees();
    } catch (err) {
      console.error('Add employee error:', err);
      alert('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/hr/employees/${editingEmployee.id}`, formData);
      setEditingEmployee(null);
      setFormData({
        username: '',
        email: '',
        full_name: '',
        phone: '',
        department: '',
        employment_type: 'Full-time',
        is_active: true
      });
      fetchEmployees();
    } catch (err) {
      console.error('Update employee error:', err);
      alert('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/api/hr/employees/${employeeId}`);
        fetchEmployees();
      } catch (err) {
        console.error('Delete employee error:', err);
        alert('Failed to delete employee');
      }
    }
  };

  const startEditing = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username,
      email: employee.email,
      full_name: employee.full_name || '',
      phone: employee.phone || '',
      department: employee.department || '',
      employment_type: employee.employment_type || 'Full-time',
      is_active: employee.is_active
    });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingEmployee) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Input
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <Input
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({...formData, employment_type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="is_active">Active Employee</label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingEmployee(null);
                    setFormData({
                      username: '',
                      email: '',
                      full_name: '',
                      phone: '',
                      department: '',
                      employment_type: 'Full-time',
                      is_active: true
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Employee List */}
      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{employee.full_name || employee.username}</h3>
                    <Badge className={getRoleBadgeColor(employee.role)}>
                      {employee.role}
                    </Badge>
                    {employee.is_active ? (
                      <Badge className="bg-green-100 text-green-800">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <UserX className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {employee.phone}
                      </div>
                    )}
                    {employee.department && (
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {employee.department}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {employee.employment_type}
                    </div>
                  </div>
                  {employee.created_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Joined: {new Date(employee.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(employee)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No employees found</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
