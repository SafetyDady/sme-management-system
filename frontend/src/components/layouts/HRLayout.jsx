import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { 
  Menu, 
  X, 
  Users, 
  UserPlus, 
  Calendar, 
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarFallback } from '../ui/avatar.jsx';
import { useState } from 'react';

const HRLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hrNavigationItems = [
    {
      name: 'HR Dashboard',
      href: '/hr',
      icon: BarChart3,
      description: 'Overview & Statistics'
    },
    {
      name: 'Employee Management',
      href: '/hr/employees',
      icon: Users,
      description: 'Manage Staff Records'
    },
    {
      name: 'Recruitment',
      href: '/hr/recruitment',
      icon: UserPlus,
      description: 'Hiring & Onboarding'
    },
    {
      name: 'Leave Management',
      href: '/hr/leaves',
      icon: Calendar,
      description: 'Time Off Requests'
    },
    {
      name: 'HR Reports',
      href: '/hr/reports',
      icon: FileText,
      description: 'Analytics & Reports'
    },
    {
      name: 'HR Settings',
      href: '/hr/settings',
      icon: Settings,
      description: 'Policies & Configuration'
    }
  ];

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

      {/* Fixed Header - HR Theme */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-blue-600 shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-green-700 mr-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">
              🏢 GC Management
            </h1>
            <span className="ml-2 text-sm text-green-200">HR Dashboard</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Button variant="ghost" className="relative text-white hover:bg-green-700">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarFallback className="bg-green-500 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-green-200 capitalize">HR Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HR Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-green-700 to-green-900 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        mt-16
      `}>
        <div className="flex flex-col h-full">
          {/* HR Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {hrNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex flex-col px-4 py-3 text-sm rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-white bg-opacity-20 text-white shadow-lg border-l-4 border-white' 
                      : 'text-green-100 hover:bg-white hover:bg-opacity-10 hover:text-white hover:translate-x-1'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs text-green-200 ml-8 mt-1">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout at bottom */}
          <div className="p-4 border-t border-green-600">
            <div className="flex items-center mb-3">
              <Avatar className="h-10 w-10 border-2 border-green-400">
                <AvatarFallback className="bg-green-500 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-green-200 capitalize">
                  HR Manager
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="w-full justify-start text-green-100 hover:text-white hover:bg-white hover:bg-opacity-10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out pt-16 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default HRLayout;
