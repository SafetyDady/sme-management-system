import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Loader2, Users, Shield } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useUsers } from '../hooks/useUsers.js';
import UserList from '../components/UserList.jsx';
import UserModal from '../components/UserModal.jsx';
import { canManageUsers } from '../utils/roleUtils.js';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, submitting, createUser, updateUser, deleteUser, toggleUserStatus } = useUsers();
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'delete'
    user: null
  });

  // Check if user has permission to manage users
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access user management. This feature requires HR or higher access level.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Modal handlers
  const openModal = (mode, user = null) => {
    setModalState({ isOpen: true, mode, user });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', user: null });
  };

  // CRUD operations
  const handleCreateUser = async (userData) => {
    const result = await createUser(userData);
    if (result.success) {
      closeModal();
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    const result = await updateUser(userId, userData);
    if (result.success) {
      closeModal();
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await deleteUser(userId);
    if (result.success) {
      closeModal();
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    await toggleUserStatus(userId, isActive);
  };

  // Modal submit handler
  const handleModalSubmit = (...args) => {
    switch (modalState.mode) {
      case 'create':
        return handleCreateUser(args[0]);
      case 'edit':
        return handleUpdateUser(args[0], args[1]);
      case 'delete':
        return handleDeleteUser(args[0]);
      default:
        return Promise.resolve();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Manage system users, roles, and permissions. Current user: {currentUser.username} ({currentUser.role})
              </CardDescription>
            </div>
            
            {/* Stats */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <UserList
              users={users}
              onEdit={(user) => openModal('edit', user)}
              onDelete={(user) => openModal('delete', user)}
              onCreateNew={() => openModal('create')}
              onToggleStatus={handleToggleUserStatus}
              loading={submitting}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <UserModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        user={modalState.user}
        onSubmit={handleModalSubmit}
        submitting={submitting}
        mode={modalState.mode}
      />
    </div>
  );
};

export default UserManagement;
