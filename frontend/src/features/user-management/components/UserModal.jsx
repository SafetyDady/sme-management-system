import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import UserForm from './UserForm.jsx';
import { getRoleDisplayName, getRoleIcon } from '../utils/roleUtils.js';

const UserModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onSubmit, 
  submitting,
  mode = 'create' // 'create', 'edit', 'delete'
}) => {
  
  const getModalTitle = () => {
    switch (mode) {
      case 'edit':
        return `Edit User - ${user?.username}`;
      case 'delete':
        return 'Delete User';
      default:
        return 'Create New User';
    }
  };

  const handleSubmit = (formData) => {
    if (mode === 'delete') {
      onSubmit(user.id);
    } else if (mode === 'edit') {
      onSubmit(user.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {user && (
              <span className="text-lg">
                {getRoleIcon(user.role)}
              </span>
            )}
            <span>{getModalTitle()}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {mode === 'delete' ? (
            // Delete Confirmation
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. This will permanently delete the user account.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">User to be deleted:</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Username:</strong> {user?.username}</div>
                  <div><strong>Email:</strong> {user?.email}</div>
                  <div className="flex items-center space-x-2">
                    <strong>Role:</strong> 
                    <span>{getRoleIcon(user?.role)}</span>
                    <span>{getRoleDisplayName(user?.role)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  Delete User
                </button>
              </div>
            </div>
          ) : (
            // Create/Edit Form
            <UserForm
              user={mode === 'edit' ? user : null}
              onSubmit={handleSubmit}
              onCancel={onClose}
              submitting={submitting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
