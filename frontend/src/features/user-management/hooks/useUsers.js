import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { userAPI } from '../../../lib/api.js';
import { toast } from 'react-toastify';
import { normalizeRole, canManageUsers } from '../utils/roleUtils.js';

export const useUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 UserManagement: Starting fetch users...');
      console.log('🔍 Current user:', user);
      console.log('🔍 User role:', user?.role);
      
      // Check if user has permission to access user management
      const normalizedRole = normalizeRole(user?.role);
      console.log('🔍 Normalized role:', normalizedRole);
      
      // Allow superadmin role access (less restrictive check)
      if (!user || !canManageUsers(user.role)) {
        console.warn('⚠️ User does not have permission to view users. Role:', user?.role);
        toast.error('You need appropriate access to view users');
        setUsers([]);
        return;
      }
      
      console.log('🔍 Calling userAPI.getUsers()...');
      const response = await userAPI.getUsers();
      console.log('📥 Raw API Response:', response);
      
      // Handle different response formats
      let userData;
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          userData = response;
          console.log('✅ Direct array format');
        } else if (response.users && Array.isArray(response.users)) {
          userData = response.users;
          console.log('✅ Nested users array format');
        } else if (response.data && Array.isArray(response.data)) {
          userData = response.data;
          console.log('✅ Nested data array format');
        } else {
          console.error('❌ Invalid users data format:', response);
          throw new Error('Invalid users data format received from server');
        }
      } else {
        throw new Error('No data received from server');
      }
      
      console.log('📊 Processed user data:', userData);
      setUsers(userData || []);
      
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to fetch users: ${error.response?.data?.detail || error.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const createUser = async (userData) => {
    try {
      setSubmitting(true);
      console.log('➕ Creating user:', userData);
      
      const response = await userAPI.createUser(userData);
      console.log('✅ User created:', response);
      
      toast.success(`User ${userData.username} created successfully!`);
      
      // Refresh the user list
      await fetchUsers();
      
      return { success: true, user: response };
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      setSubmitting(true);
      console.log('✏️ Updating user:', userId, userData);
      
      const response = await userAPI.updateUser(userId, userData);
      console.log('✅ User updated:', response);
      
      toast.success(`User updated successfully!`);
      
      // Refresh the user list
      await fetchUsers();
      
      return { success: true, user: response };
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      setSubmitting(true);
      console.log('🗑️ Deleting user:', userId);
      
      await userAPI.deleteUser(userId);
      console.log('✅ User deleted');
      
      toast.success('User deleted successfully!');
      
      // Refresh the user list
      await fetchUsers();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId, isActive) => {
    try {
      setSubmitting(true);
      console.log('🔄 Toggling user status:', userId, 'to:', isActive);
      
      const response = await userAPI.toggleUserStatus(userId, isActive);
      console.log('✅ User status toggled:', response);
      
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`);
      
      // Refresh the user list
      await fetchUsers();
      
      return { success: true, user: response };
    } catch (error) {
      console.error('❌ Failed to toggle user status:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to toggle user status';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Load users on mount and user change
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    submitting,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  };
};
