import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Bell, 
  Search, 
  Filter,
  Eye,
  Mail,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const UserAssignmentDashboard = () => {
  const { user, getAuthToken } = useAuth();
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [assignmentSummary, setAssignmentSummary] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignFormData, setAssignFormData] = useState({
    username: '',
    role: 'employee',
    temporary_password: ''
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Load data on component mount
  useEffect(() => {
    if (user?.role && ['superadmin', 'system_admin'].includes(user.role)) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Load all dashboard data in parallel
      const [unassignedRes, summaryRes, notificationsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/employees/unassigned`, { headers }),
        axios.get(`${API_BASE}/api/employees/assignment-summary`, { headers }),
        axios.get(`${API_BASE}/api/notifications?type=employee_assignment`, { headers })
      ]);

      setUnassignedEmployees(unassignedRes.data);
      setAssignmentSummary(summaryRes.data);
      setNotifications(notificationsRes.data.slice(0, 5)); // Latest 5 notifications
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (employee) => {
    setSelectedEmployee(employee);
    setAssignFormData({
      username: employee.emp_code || '',
      role: 'employee',
      temporary_password: ''
    });
    setShowAssignModal(true);
  };

  const submitAssignment = async () => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        employee_id: selectedEmployee.employee_id,
        username: assignFormData.username,
        role: assignFormData.role,
        temporary_password: assignFormData.temporary_password || undefined
      };

      await axios.post(`${API_BASE}/api/employees/assign-user`, payload, { headers });
      
      setSuccess(`User account assigned to ${selectedEmployee.first_name} ${selectedEmployee.last_name}`);
      setShowAssignModal(false);
      loadDashboardData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign user account');
    }
  };

  const handleUnassignUser = async (employeeId) => {
    if (!confirm('Are you sure you want to remove this user assignment?')) return;

    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API_BASE}/api/employees/${employeeId}/unassign-user`, { headers });
      setSuccess('User assignment removed successfully');
      loadDashboardData();
    } catch (err) {
      setError('Failed to remove user assignment');
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      const token = await getAuthToken();
      await axios.put(
        `${API_BASE}/api/notifications/${notificationId}/read`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadDashboardData();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Filter employees based on search term
  const filteredEmployees = unassignedEmployees.filter(emp => 
    `${emp.first_name} ${emp.last_name} ${emp.emp_code} ${emp.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (!['superadmin', 'system_admin'].includes(user?.role)) {
    return (
      <Alert>
        <AlertDescription>
          Access denied. This dashboard is only available for System Administrators.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Assignment Dashboard</h1>
        <Button onClick={loadDashboardData} disabled={loading}>
          Refresh Data
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{assignmentSummary.total_employees || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Users</p>
                <p className="text-2xl font-bold">{assignmentSummary.assigned_users || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold">{assignmentSummary.unassigned_employees || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Notifications</p>
                <p className="text-2xl font-bold">{notifications.filter(n => !n.read_at).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Employees List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employees Without User Accounts ({filteredEmployees.length})
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">Loading employees...</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {searchTerm ? 'No employees found matching search criteria' : 'All employees have user accounts assigned'}
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div key={employee.employee_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {employee.first_name} {employee.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {employee.emp_code} • {employee.position} • {employee.department}
                            </p>
                            <p className="text-xs text-gray-500">
                              Started: {new Date(employee.start_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={employee.active_status ? "success" : "secondary"}>
                          {employee.active_status ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button 
                          onClick={() => handleAssignUser(employee)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign User
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        !notification.read_at ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                      onClick={() => !notification.read_at && markNotificationRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Assign User Account
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Employee:</p>
              <p className="font-semibold">
                {selectedEmployee?.first_name} {selectedEmployee?.last_name}
              </p>
              <p className="text-sm text-gray-600">
                {selectedEmployee?.emp_code} • {selectedEmployee?.department}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <Input
                  value={assignFormData.username}
                  onChange={(e) => setAssignFormData({...assignFormData, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={assignFormData.role}
                  onChange={(e) => setAssignFormData({...assignFormData, role: e.target.value})}
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Temporary Password (optional)
                </label>
                <Input
                  type="password"
                  value={assignFormData.temporary_password}
                  onChange={(e) => setAssignFormData({...assignFormData, temporary_password: e.target.value})}
                  placeholder="Leave blank for auto-generated password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left blank, a secure password will be generated automatically
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={submitAssignment}
                disabled={!assignFormData.username.trim()}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Assign & Send Email
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAssignmentDashboard;
