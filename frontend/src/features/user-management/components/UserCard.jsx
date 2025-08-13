import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Edit3, 
  Trash2, 
  Mail, 
  User,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
  Power,
  PowerOff
} from 'lucide-react';
import { getRoleDisplayName, getRoleIcon, getRoleColor, canEditRole } from '../utils/roleUtils.js';
import { useAuth } from '../../../hooks/useAuth.jsx';

const UserCard = ({ user, onEdit, onDelete, onToggleStatus, loading }) => {
  const { user: currentUser } = useAuth();
  
  const canEdit = canEditRole(currentUser?.role, user.role);
  const canDelete = canEdit && user.id !== currentUser?.id; // Can't delete yourself
  const canToggleStatus = canEdit && user.id !== currentUser?.id; // Can't disable yourself

  const getRoleIconComponent = (role) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg">{getRoleIcon(user.role)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Role Badge & Status */}
            <div className="mb-3 flex items-center space-x-2">
              <Badge className={`${getRoleColor(user.role)} px-2 py-1 text-xs font-medium rounded-full`}>
                <div className="flex items-center space-x-1">
                  {getRoleIconComponent(user.role)}
                  <span>{getRoleDisplayName(user.role)}</span>
                </div>
              </Badge>
              
              {/* Status Badge */}
              <Badge 
                variant={user.is_active ? 'default' : 'secondary'}
                className={`px-2 py-1 text-xs font-medium rounded-full ${
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
            </div>

            {/* User Stats/Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>ID: {user.id}</div>
              {user.created_at && (
                <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          {/* Actions */}
                    {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-2 mt-2">
            {/* Toggle Status Button - spans full width if present */}
            {canToggleStatus && (
              <Button
                variant={user.is_active ? 'destructive' : 'default'}
                size="xs"
                onClick={() => onToggleStatus && onToggleStatus(user.id, !user.is_active)}
                className={`col-span-5 h-6 flex items-center justify-center space-x-1 text-xs ${
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

            {/* Edit Button - 2 columns */}
            <Button
              variant="outline"
              size="xs"
              onClick={() => onEdit(user)}
              className="col-span-2 h-6 flex items-center justify-center space-x-1 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </Button>

            {/* Delete Button - 3 columns (20% longer) */}
            <Button
              variant="destructive"
              size="xs"
              onClick={() => onDelete(user.id)}
              className="col-span-3 h-6 flex items-center justify-center space-x-1 text-xs bg-red-500 hover:bg-red-600 text-white border-red-500"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Special indicators */}
        {user.id === currentUser?.id && (
          <div className="mt-2 text-xs text-blue-600 font-medium">
            👤 This is you
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
