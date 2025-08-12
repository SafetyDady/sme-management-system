import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
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
  Calendar,
  Clock,
  UserPlus,
  FileText,
  Building
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { useState } from 'react';

const HRLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getHRNavigationItems = () => {
    return [
      {
        name: 'HR Dashboard',
        href: '/hr',
        icon: Home,
        description: 'HR overview and metrics'
      },
      {
        name: 'Employee Management',
        href: '/hr/employees',
        icon: Users,
        description: 'Manage employee records'
      },
      {
        name: 'Leave Management',
        href: '/hr/leaves',
        icon: Calendar,
        description: 'Approve/reject leaves'
      },
      {
        name: 'Recruitment',
        href: '/hr/recruitment',
        icon: UserPlus,
        description: 'Hiring and recruitment'
      },
      {
        name: 'HR Reports',
        href: '/hr/reports',
        icon: FileText,
        description: 'Generate HR reports'
      },
      {
        name: 'Department Management',
        href: '/hr/departments',
        icon: Building,
        description: 'Manage departments'
      },
      {
        name: 'My Profile',
        href: '/profile',
        icon: User,
        description: 'Personal profile settings'
      }
    ];
  };

  const navigationItems = getHRNavigationItems();

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
            <span className="ml-2 text-sm text-green-200">HR Portal</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* HR Quick Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-xs text-green-100">
                <span className="font-semibold">12</span> Employees
              </div>
              <div className="text-xs text-green-100">
                <span className="font-semibold">3</span> Pending
              </div>
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" className="relative text-white hover:bg-green-700">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center">
                5
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

      {/* Sidebar - HR Theme */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-green-700 to-blue-800 shadow-lg transform transition-transform duration-300 ease-in-out
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
                    flex flex-col px-4 py-3 text-sm font-medium rounded-lg transition-colors group
                    ${isActive 
                      ? 'bg-white bg-opacity-20 text-white shadow-lg' 
                      : 'text-green-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  <span className="text-xs text-green-200 ml-8 mt-1 group-hover:text-green-100">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* HR info and logout at bottom */}
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
                <p className="text-xs text-green-200">
                  HR Manager - Employee Access
                </p>
              </div>
            </div>

            {/* HR Quick Actions */}
            <div className="space-y-2 mb-3">
              <Button 
                size="sm"
                variant="ghost" 
                className="w-full justify-start text-green-100 hover:text-white hover:bg-white hover:bg-opacity-10"
              >
                <Clock className="mr-2 h-4 w-4" />
                Pending Leaves
              </Button>
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
      <div className={`transition-all duration-300 ease-in-out pt-16 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default HRLayout;
