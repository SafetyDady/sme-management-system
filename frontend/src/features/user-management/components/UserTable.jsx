import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Edit3, 
  Trash2, 
  CheckCircle,
  XCircle,
  Power,
  PowerOff,
  Crown,
  Shield,
  Users,
  User,
  UserCheck,
  UserX,
  Link
} from 'lucide-react';
import { getRoleDisplayName, getRoleIcon, getRoleColor, canEditRole } from '../utils/roleUtils.js';
import { useAuth } from '../../../hooks/useAuth.jsx';

const UserTable = ({ users, onEdit, onDelete, onToggleStatus, onEmployeeAssign, loading }) => {
  const { user: currentUser } = useAuth();

  const getRoleIconComponent = (role) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'hr':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">No users match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee Assignment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => {
            const canEdit = canEditRole(currentUser?.role, user.role);
            const canDelete = canEdit && user.id !== currentUser?.id;
            const canToggleStatus = canEdit && user.id !== currentUser?.id;

            return (
              <tr key={user.id} className={`hover:bg-gray-50 ${user.id === currentUser?.id ? 'bg-blue-50' : ''}`}>
                {/* User Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                        <span>{user.username}</span>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-blue-600 font-medium">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">ID: {user.id}</div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${getRoleColor(user.role)} px-3 py-1 text-xs font-medium rounded-full`}>
                    <div className="flex items-center space-x-1">
                      {getRoleIconComponent(user.role)}
                      <span>{getRoleDisplayName(user.role)}</span>
                    </div>
                  </Badge>
                </td>

                {/* Employee Assignment */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {user.employee_id ? (
                      <>
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <div className="text-sm">
                          <span className="text-gray-900 font-medium">Employee #{user.employee_id}</span>
                          <Badge variant="outline" className="ml-1 text-green-600 border-green-200">
                            Assigned
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 text-gray-400" />
                        <div className="text-sm">
                          <span className="text-gray-500">Not assigned</span>
                          <Badge variant="outline" className="ml-1 text-gray-500">
                            Unassigned
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={user.is_active ? 'default' : 'secondary'}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {user.is_active ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </Badge>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Employee Assignment Button (SystemAdmin only) */}
                    {currentUser?.role === 'system_admin' && onEmployeeAssign && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onEmployeeAssign(user)}
                        className="h-6 px-2 flex items-center space-x-1 text-xs hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                      >
                        <Link className="h-3 w-3" />
                        <span>Employee</span>
                      </Button>
                    )}

                    {/* Toggle Status Button */}
                    {canToggleStatus && (
                      <Button
                        variant={user.is_active ? 'destructive' : 'default'}
                        size="xs"
                        onClick={() => onToggleStatus && onToggleStatus(user.id, !user.is_active)}
                        className={`h-6 px-2 flex items-center space-x-1 text-xs ${
                          user.is_active 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <PowerOff className="h-3 w-3" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <Power className="h-3 w-3" />
                            <span>Activate</span>
                          </>
                        )}
                      </Button>
                    )}

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onEdit(user)}
                      className="h-6 px-2 flex items-center space-x-1 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => onDelete(user.id)}
                      className="h-6 px-3 flex items-center space-x-1 text-xs bg-red-500 hover:bg-red-600 text-white border-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
