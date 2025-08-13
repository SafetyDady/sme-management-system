import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { hasRole, getRedirectPath } from '../lib/auth';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import useSecurityCheck from '../hooks/useSecurityCheck.jsx';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasShownError, setHasShownError] = useState(false);
  const location = useLocation();
  
  // Use security check hook for enhanced protection
  const { isValid } = useSecurityCheck(requiredRole);

  // Force re-authentication check on every route change
  useEffect(() => {
    setHasShownError(false);
    
    // Clear browser history on sensitive routes to prevent back button abuse
    if (requiredRole === 'superadmin' && user?.role !== 'superadmin') {
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location.pathname, requiredRole, user?.role]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    if (!hasShownError) {
      toast.error('Please login to access this page');
      setHasShownError(true);
    }
    // Clear browser history to prevent back button abuse
    window.history.replaceState(null, '', '/login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access with strict validation
  if (requiredRole) {
    const currentUserRole = user?.role;
    const hasPermission = hasRole(user, [requiredRole]);
    
    console.log('🔐 Strict role validation:', {
      requiredRole,
      currentUserRole,
      hasPermission,
      location: location.pathname
    });
    
    if (!hasPermission) {
      if (!hasShownError) {
        console.log('❌ Access denied for role:', currentUserRole, 'Required:', requiredRole);
        toast.error(`Access denied. This page requires ${requiredRole} role.`);
        setHasShownError(true);
      }
      
      // Force redirect to user's appropriate dashboard
      const redirectPath = getRedirectPath(currentUserRole);
      console.log('🔀 Redirecting to appropriate dashboard:', redirectPath);
      
      // Clear browser history to prevent back button abuse
      window.history.replaceState(null, '', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  // Additional security check from useSecurityCheck hook
  if (!isValid) {
    console.log('❌ Security check failed - forcing logout');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Access granted for role:', user?.role);
  return children;
};

export default ProtectedRoute;

