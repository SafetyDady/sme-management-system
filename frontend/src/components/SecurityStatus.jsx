import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Shield, ShieldCheck, ShieldX, Eye, EyeOff } from 'lucide-react';

const SecurityStatus = () => {
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);

  useEffect(() => {
    if (isAuthenticated && !sessionStart) {
      setSessionStart(Date.now());
    } else if (!isAuthenticated) {
      setSessionStart(null);
    }
  }, [isAuthenticated, sessionStart]);

  const formatDuration = (startTime) => {
    if (!startTime) return '0m';
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getSecurityLevel = (role) => {
    const levels = {
      'superadmin': { level: 'Maximum', color: 'text-red-600', icon: Shield },
      'admin': { level: 'High', color: 'text-orange-600', icon: ShieldCheck },
      'director': { level: 'High', color: 'text-orange-600', icon: ShieldCheck },
      'manager': { level: 'Medium', color: 'text-yellow-600', icon: ShieldCheck },
      'hr': { level: 'Medium', color: 'text-yellow-600', icon: ShieldCheck },
      'supervisor': { level: 'Medium', color: 'text-yellow-600', icon: ShieldCheck },
      'engineer': { level: 'Standard', color: 'text-blue-600', icon: ShieldCheck },
      'purchasing': { level: 'Standard', color: 'text-blue-600', icon: ShieldCheck },
      'store': { level: 'Standard', color: 'text-blue-600', icon: ShieldCheck },
      'accounting': { level: 'Standard', color: 'text-blue-600', icon: ShieldCheck },
      'employee': { level: 'Basic', color: 'text-green-600', icon: ShieldCheck },
      'client': { level: 'Limited', color: 'text-gray-600', icon: ShieldX }
    };
    return levels[role] || { level: 'Unknown', color: 'text-gray-400', icon: ShieldX };
  };

  if (!isAuthenticated) return null;

  const security = getSecurityLevel(user?.role);
  const SecurityIcon = security.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white shadow-lg rounded-lg border transition-all duration-300 ${
        isVisible ? 'w-80 p-4' : 'w-12 h-12 p-2 cursor-pointer hover:bg-gray-50'
      }`}>
        {!isVisible ? (
          <div 
            className="flex items-center justify-center h-full"
            onClick={() => setIsVisible(true)}
            title="Security Status"
          >
            <SecurityIcon className={`w-6 h-6 ${security.color}`} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <SecurityIcon className={`w-5 h-5 ${security.color}`} />
                <span className="font-semibold text-gray-900">Security Status</span>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">User:</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className={`font-medium ${security.color}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Security Level:</span>
                <span className={`font-medium ${security.color}`}>
                  {security.level}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Session:</span>
                <span className="font-medium text-blue-600">
                  {formatDuration(sessionStart)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Protected:</span>
                <span className="font-medium text-green-600 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Active
                </span>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-gray-500 text-center">
                  🔒 Enhanced security active<br/>
                  Back-button protection enabled
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityStatus;
