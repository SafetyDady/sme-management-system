import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { getRedirectPath } from '../lib/auth';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard Redirect Component
 * Redirects users to their role-specific dashboard
 * Replaces the old generic Dashboard.jsx
 */
const DashboardRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.role);
      console.log('🔀 Redirecting to role-specific dashboard:', {
        role: user.role,
        redirectPath: redirectPath
      });
      navigate(redirectPath, { replace: true });
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
        <p className="text-sm text-gray-400 mt-2">
          Role: {user?.role || 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default DashboardRedirect;
