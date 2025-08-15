import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  UserCheck,
  UserX, 
  Mail, 
  Eye,
  Search,
  Shield,
  Calendar,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const AssignedEmployeesManager = () => {
  const { user, getAuthToken } = useAuth();
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user?.role && ['superadmin', 'system_admin'].includes(user.role)) {
      loadAssignedEmployees();
    }
  }, [user]);

  const loadAssignedEmployees = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Get all employees with user assignments
      const response = await axios.get(`${API_BASE}/api/employees/assigned`, { headers });
      setAssignedEmployees(response.data);
    } catch (err) {
      setError('Failed to load assigned employees');
      console.error('Load assigned employees error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignUser = async (employee) => {
    if (!confirm(`Are you sure you want to remove user account for ${employee.first_name} ${employee.last_name}?`)) {
      return;
    }

    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API_BASE}/api/employees/${employee.employee_id}/unassign-user`, { headers });
      setSuccess(`User account removed from ${employee.first_name} ${employee.last_name}`);
      loadAssignedEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove user assignment');
    }
  };

  const handleResendCredentials = async (employee) => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${API_BASE}/api/employees/${employee.employee_id}/resend-credentials`, {}, { headers });
      setSuccess(`Login credentials resent to ${employee.first_name} ${employee.last_name}`);
    } catch (err) {
      setError('Failed to resend credentials');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      superadmin: 'bg-purple-500',
      system_admin: 'bg-red-500',
      hr: 'bg-blue-500',
      employee: 'bg-green-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const filteredEmployees = assignedEmployees.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name} ${emp.emp_code} ${emp.department} ${emp.user_username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || emp.user_role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assigned User Accounts</h1>
        <Button onClick={loadAssignedEmployees} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-500 text-green-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, emp code, username, or department..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 border rounded"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="system_admin">System Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Assigned</p>
                <p className="text-xl font-bold">{filteredEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-xl font-bold">
                  {filteredEmployees.filter(emp => ['superadmin', 'system_admin'].includes(emp.user_role)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">HR Staff</p>
                <p className="text-xl font-bold">
                  {filteredEmployees.filter(emp => emp.user_role === 'hr').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-xl font-bold">
                  {filteredEmployees.filter(emp => emp.user_role === 'employee').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees with User Accounts ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">Loading assigned employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filterRole !== 'all' 
                  ? 'No employees found matching current filters' 
                  : 'No employees have user accounts assigned yet'
                }
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div key={employee.employee_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    {/* Employee Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {employee.first_name[0]}{employee.last_name[0]}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <Badge className={`${getRoleBadgeColor(employee.user_role)} text-white`}>
                            {employee.user_role.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant={employee.active_status ? "success" : "secondary"}>
                            {employee.active_status ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span><strong>Employee ID:</strong> {employee.emp_code}</span>
                            <span><strong>Username:</strong> {employee.user_username}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span><strong>Position:</strong> {employee.position}</span>
                            <span><strong>Department:</strong> {employee.department}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Started: {new Date(employee.start_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              Account Created: {new Date(employee.user_created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendCredentials(employee)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Resend Credentials
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnassignUser(employee)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Remove Account
                      </Button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {employee.contact_phone && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        {employee.contact_phone && (
                          <span><strong>Phone:</strong> {employee.contact_phone}</span>
                        )}
                        {employee.user_last_login && (
                          <span><strong>Last Login:</strong> {new Date(employee.user_last_login).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedEmployeesManager;
