import React, { useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Search, UserPlus, Filter, Users, Grid3X3, Table } from 'lucide-react';
import UserCard from './UserCard.jsx';
import UserTable from './UserTable.jsx';
import { AVAILABLE_ROLES, getRoleDisplayName, getRoleIcon } from '../utils/roleUtils.js';

const UserList = ({ users, onEdit, onDelete, onCreateNew, onToggleStatus, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('username');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'username':
          return a.username?.localeCompare(b.username) || 0;
        case 'email':
          return a.email?.localeCompare(b.email) || 0;
        case 'role':
          return a.role?.localeCompare(b.role) || 0;
        case 'created':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

  // Get role counts for filter badges
  const getRoleCounts = () => {
    const counts = {};
    users.forEach(user => {
      counts[user.role] = (counts[user.role] || 0) + 1;
    });
    return counts;
  };

  const roleCounts = getRoleCounts();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full sm:w-48">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>All Roles ({users.length})</span>
                </div>
              </SelectItem>
              {AVAILABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  <div className="flex items-center space-x-2">
                    <span>{getRoleIcon(role)}</span>
                    <span>{getRoleDisplayName(role)}</span>
                    <span className="text-sm text-gray-500">
                      ({roleCounts[role] || 0})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-40">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="username">Sort by Name</SelectItem>
              <SelectItem value="email">Sort by Email</SelectItem>
              <SelectItem value="role">Sort by Role</SelectItem>
              <SelectItem value="created">Sort by Created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('cards')}
            className="h-7 px-2"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('table')}
            className="h-7 px-2"
          >
            <Table className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>

        {/* Create User Button */}
        <Button onClick={onCreateNew} className="whitespace-nowrap">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredUsers.length} of {users.length} users
          {roleFilter !== 'all' && ` with role "${getRoleDisplayName(roleFilter)}"`}
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        
        {(searchTerm || roleFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* User Display */}
      {filteredUsers.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                loading={loading}
              />
            ))}
          </div>
        ) : (
          <UserTable
            users={filteredUsers}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            loading={loading}
          />
        )
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || roleFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating a new user.'}
          </p>
          {(!searchTerm && roleFilter === 'all') && (
            <div className="mt-6">
              <Button onClick={onCreateNew}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add your first user
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;
