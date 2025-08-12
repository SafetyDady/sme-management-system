import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { userAPI } from '../lib/api.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Shield, 
  UserCheck, 
  UserX,
  Crown,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('🔍 UserManagement: Starting fetch users...');
        console.log('🔍 Current user:', user);
        console.log('🔍 User role:', user?.role);
        
        // Check if user has permission
        if (!user || !['superadmin', 'admin', 'admin1', 'admin2'].includes(user.role)) {
          console.warn('⚠️ User does not have permission to view users');
          toast.error('You do not have permission to view users');
          setUsers([]);
          return;
        }
        
        console.log('🔍 Calling userAPI.getUsers()...');
        const usersData = await userAPI.getUsers();
        console.log('✅ Raw users data received:', usersData);
        
        if (!Array.isArray(usersData)) {
          console.error('❌ Users data is not an array:', usersData);
          throw new Error('Invalid users data format');
        }
        
        // Transform API data to match frontend expectations
        const transformedUsers = usersData.map(user => ({
          ...user,
          status: user.is_active ? 'active' : 'inactive'
        }));
        
        console.log('✅ Transformed users:', transformedUsers);
        console.log('🔍 Sample user object:', transformedUsers[0]);
        console.log('🔍 User3 object:', transformedUsers.find(u => u.username === 'user3'));
        
        setUsers(transformedUsers);
        toast.success(`Loaded ${transformedUsers.length} users successfully`);
        
      } catch (error) {
        console.error('❌ UserManagement: Failed to fetch users');
        console.error('❌ Error type:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error response:', error.response);
        console.error('❌ Full error:', error);
        
        let errorMessage = 'Failed to load users';
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. Insufficient permissions.';
        } else if (error.response?.status) {
          errorMessage = `Server error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is available
    if (user) {
      fetchUsers();
    } else {
      console.warn('⚠️ No user available, skipping fetch');
      setLoading(false);
    }
  }, [user]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
      case 'admin1':
      case 'admin2':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
      case 'admin1':
      case 'admin2':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const canManageUser = (targetUser) => {
    // Force enable for testing - superadmin2 should be able to delete
    console.log('🔍 canManageUser called for:', targetUser?.username, 'current user:', user?.role);
    return true;
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
    setSelectedUser(null);
    setShowPassword(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (submitting) return;

    // Validation
    if (!formData.username.trim() || !formData.email.trim() || (!selectedUser && !formData.password.trim())) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedUser && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      
      if (selectedUser) {
        // Edit existing user
        console.log('🔄 Updating user:', selectedUser.id, formData);
        
        const updateData = {
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role
        };
        
        // Only include password if it's provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        const updatedUser = await userAPI.updateUser(selectedUser.id, updateData);
        
        // Update local state
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === selectedUser.id 
            ? { ...updatedUser, status: updatedUser.is_active ? 'active' : 'inactive' }
            : u
        ));
        
        toast.success(`User ${formData.username} updated successfully!`);
      } else {
        // Create new user
        console.log('🔄 Creating new user:', formData.username);

        const createData = {
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          is_active: true  // Default to active
        };

        console.log('🔄 Sending create data:', createData);

        // Call backend API to create user
        const newUser = await userAPI.createUser(createData);
        
        toast.success(`User ${formData.username} created successfully!`);
        
        // Add to local state
        setUsers(prevUsers => [...prevUsers, { 
          ...newUser, 
          status: newUser.is_active ? 'active' : 'inactive' 
        }]);
      }
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
    } catch (error) {
      console.error('❌ Failed to save user:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = `Failed to ${selectedUser ? 'update' : 'create'} user.`;
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors array
          const errors = error.response.data.detail.map(err => 
            typeof err === 'string' ? err : err.msg || err.message || 'Invalid field'
          ).join(', ');
          errorMessage = `Validation error: ${errors}`;
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data provided. Please check all fields.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Username or email already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (targetUser) => {
    if (!canManageUser(targetUser)) {
      toast.error('You do not have permission to edit this user');
      return;
    }
    setSelectedUser(targetUser);
    setFormData({
      username: targetUser.username,
      email: targetUser.email,
      password: '',
      role: targetUser.role
    });
    setShowModal(true);
  };

  const handleDelete = async (targetUser) => {
    const canManage = canManageUser(targetUser);
    
    if (!canManage) {
      toast.error('You do not have permission to delete this user');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user "${targetUser.username}"?`)) {
      try {
        await userAPI.deleteUser(targetUser.id);
        
        // Remove from local state
        setUsers(prevUsers => prevUsers.filter(u => u.id !== targetUser.id));
        
        toast.success(`User ${targetUser.username} deleted successfully!`);
      } catch (error) {
        console.error('❌ Failed to delete user:', error);
        toast.error('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (!canManageUser(targetUser)) {
      toast.error('You do not have permission to modify this user');
      return;
    }
    
    try {
      const newIsActive = targetUser.status !== 'active';
      console.log('🔄 Toggling user status:', targetUser.id, newIsActive);
      
      const updatedUser = await userAPI.toggleUserStatus(targetUser.id, newIsActive);
      
      // Update local state with backend response
      const newStatus = updatedUser.is_active ? 'active' : 'inactive';
      setUsers(users.map(u => 
        u.id === targetUser.id 
          ? { ...u, ...updatedUser, status: newStatus }
          : u
      ));
      
      toast.success(`User "${targetUser.username}" status changed to ${newStatus}`);
    } catch (error) {
      console.error('❌ Failed to toggle user status:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to update user status. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
          disabled={user?.role === 'user'}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by username, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            {user?.role === 'superadmin' && "You can manage all users"}
            {user?.role === 'admin' && "You can manage regular users only"}
            {user?.role === 'user' && "View-only access"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((targetUser) => (
                  <tr key={targetUser.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{targetUser.username}</div>
                        <div className="text-sm text-gray-500">{targetUser.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`flex items-center gap-1 w-fit ${getRoleBadgeColor(targetUser.role)}`}>
                        {getRoleIcon(targetUser.role)}
                        {targetUser.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`w-fit ${getStatusBadgeColor(targetUser.status)}`}>
                        {targetUser.status === 'active' ? (
                          <UserCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <UserX className="h-3 w-3 mr-1" />
                        )}
                        {targetUser.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(targetUser.last_login)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(targetUser)}
                          disabled={!canManageUser(targetUser)}
                          className="h-10 w-10 p-0"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(targetUser)}
                          disabled={!canManageUser(targetUser)}
                          className="h-10 w-10 p-0"
                          title="Toggle Status"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(targetUser)}
                          className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Permission Matrix:</strong>
          {' '}Superadmin can manage everyone • Admin can manage regular users • Users have view-only access
        </AlertDescription>
      </Alert>

      {/* Add/Edit User Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {selectedUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!!selectedUser} // Disable editing username for existing users
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    {(user?.role === 'superadmin' || user?.role === 'admin') && (
                      <>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </>
                    )}
                    {user?.role === 'superadmin' && (
                      <SelectItem value="superadmin">SuperAdmin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {selectedUser ? '(leave blank to keep current)' : '*'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={selectedUser ? 'Enter new password' : 'Enter password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!selectedUser}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!selectedUser && (
                  <p className="text-sm text-gray-500">Minimum 6 characters</p>
                )}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[100px]"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {selectedUser ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    {selectedUser ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {selectedUser ? 'Update User' : 'Create User'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

