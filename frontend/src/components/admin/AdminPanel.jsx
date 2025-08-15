import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck,
  Bell, 
  Settings,
  Dashboard,
  Menu,
  X
} from 'lucide-react';
import UserAssignmentDashboard from './UserAssignmentDashboard';
import AssignedEmployeesManager from './AssignedEmployeesManager';
import NotificationCenter from './NotificationCenter';
import { useAuth } from '../../hooks/useAuth';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check if user has admin access
  if (!user || !['superadmin', 'system_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            This admin panel is only available for System Administrators.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Assignment Dashboard',
      icon: <Dashboard className="h-5 w-5" />,
      description: 'Assign user accounts to employees'
    },
    {
      id: 'assigned',
      label: 'Assigned Users',
      icon: <UserCheck className="h-5 w-5" />,
      description: 'Manage existing user assignments'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'View system notifications'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <UserAssignmentDashboard />;
      case 'assigned':
        return <AssignedEmployeesManager />;
      case 'notifications':
        return <NotificationCenter />;
      default:
        return <UserAssignmentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">User Assignment System</p>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded hover:bg-gray-100"
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {isSidebarOpen && (
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${
                    activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                {user.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-600 uppercase">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">
                {menuItems.find(item => item.id === activeTab)?.description}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold">{user.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="h-full overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
