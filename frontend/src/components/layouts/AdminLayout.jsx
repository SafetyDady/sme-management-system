import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
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
  Bell,
  Database,
  Activity,
  Briefcase,
  Cog
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarFallback } from '../ui/avatar.jsx';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getAdminNavigationItems = () => {
    return [
      {
        name: 'Admin Dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Main admin overview'
      },
      {
        name: 'User Management',
        href: '/users',
        icon: Users,
        description: 'Manage system users'
      },
      {
        name: 'HR Management',
        href: '/hr',
        icon: Briefcase,
        description: 'HR operations'
      },
      {
        name: 'Reports & Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'System reports'
      },
      {
        name: 'System Settings',
        href: '/system',
        icon: Settings,
        description: 'Configure settings'
      },
      {
        name: 'Security',
        href: '/security',
        icon: Shield,
        description: 'Security management'
      },
      {
        name: 'My Profile',
        href: '/profile',
        icon: User,
        description: 'Personal settings'
      }
    ];
  };

  const navigationItems = getAdminNavigationItems();

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

      {/* Fixed Header - Admin Theme */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 mr-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">
              🏢 GC Management
            </h1>
            <span className="ml-2 text-sm text-blue-200">Admin Panel</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Admin Quick Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-xs text-blue-100">
                <span className="font-semibold">25</span> Users
              </div>
              <div className="text-xs text-blue-100">
                <span className="font-semibold">Active</span> System
              </div>
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" className="relative text-white hover:bg-blue-700">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-blue-200 capitalize">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Admin Theme */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-700 to-indigo-800 shadow-lg transform transition-transform duration-300 ease-in-out
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
                    flex flex-col px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 bg-opacity-90 text-white shadow-lg border border-blue-400' 
                      : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-70 hover:text-white font-medium hover:shadow-md'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                    <span className={`${isActive ? 'text-white font-bold' : 'group-hover:text-white group-hover:font-semibold'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-xs ml-8 mt-1 ${
                    isActive 
                      ? 'text-blue-100 font-semibold' 
                      : 'text-blue-200 group-hover:text-blue-100 group-hover:font-medium'
                  }`}>
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Admin info and logout at bottom */}
          <div className="p-4 border-t border-blue-600">
            <div className="flex items-center mb-3">
              <Avatar className="h-10 w-10 border-2 border-blue-400">
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-blue-200">
                  Administrator - System Access
                </p>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="space-y-2 mb-3">
              <Button 
                size="sm"
                variant="ghost" 
                className="w-full justify-start text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10"
              >
                <Cog className="mr-2 h-4 w-4" />
                Quick Settings
              </Button>
            </div>

            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="w-full justify-start text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10"
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

export default AdminLayout;
