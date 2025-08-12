import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { hasRole } from '../lib/auth';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  User, 
  Settings, 
  LogOut,
  Shield,
  BarChart3,
  Bell
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { useState } from 'react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = () => {
    const items = [];
    
    // Always show Dashboard
    items.push({
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['superadmin', 'admin', 'hr', 'user']
    });

    // HR Dashboard - for HR, Admin, and SuperAdmin
    if (hasRole(user, ['superadmin', 'admin', 'hr'])) {
      items.push({
        name: 'HR Management',
        href: '/hr',
        icon: Users,
        roles: ['superadmin', 'admin', 'hr']
      });
    }

    // User Management - only for superadmin and admin (HR can also manage users)
    if (hasRole(user, ['superadmin', 'admin', 'hr'])) {
      items.push({
        name: 'User Management',
        href: '/users',
        icon: User,
        roles: ['superadmin', 'admin', 'hr']
      });
    }

    // System settings - only for superadmin
    if (hasRole(user, ['superadmin'])) {
      items.push({
        name: 'System Settings',
        href: '/system',
        icon: Settings,
        roles: ['superadmin']
      });
    }

    // Analytics - all roles
    items.push({
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['superadmin', 'admin', 'hr', 'user']
    });

    return items.filter(item => 
      item.roles.includes(user?.role)
    );
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-purple-700 mr-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">
              GC Management
            </h1>
            <span className="ml-2 text-sm text-purple-200">./</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Button variant="ghost" className="relative text-white hover:bg-purple-700">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                1
              </span>
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarFallback className="bg-purple-500 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-purple-200 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-700 to-purple-900 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        mt-16
      `}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-white bg-opacity-20 text-white shadow-lg' 
                      : 'text-purple-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout at bottom */}
          <div className="p-4 border-t border-purple-600">
            <div className="flex items-center mb-3">
              <Avatar className="h-10 w-10 border-2 border-purple-400">
                <AvatarFallback className="bg-purple-500 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-purple-200 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="w-full justify-start text-purple-100 hover:text-white hover:bg-white hover:bg-opacity-10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out pt-16 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

