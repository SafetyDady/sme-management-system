import { useEffect } from 'react';
import { useAuth } from './useAuth.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { hasRole, getRedirectPath } from '../lib/auth';
import { toast } from 'react-toastify';

/**
 * Security hook to prevent unauthorized access via browser history
 * Checks user role permissions on every route change and page visibility change
 */
export const useSecurityCheck = (requiredRole = null) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to validate current user permissions
    const validatePermissions = () => {
      console.log('🔒 Security Check:', {
        path: location.pathname,
        requiredRole,
        userRole: user?.role,
        isAuthenticated
      });

      // Check if user is still authenticated
      if (!isAuthenticated || !user) {
        console.log('🚨 Security violation: User not authenticated');
        toast.error('Session expired. Please login again.');
        navigate('/login', { replace: true });
        return false;
      }

      // Check role permissions if required
      if (requiredRole) {
        const hasPermission = hasRole(user, [requiredRole]);
        
        if (!hasPermission) {
          console.log('🚨 Security violation: Insufficient permissions', {
            userRole: user.role,
            requiredRole,
            hasPermission
          });
          
          toast.error(`Access denied. ${requiredRole} role required.`);
          
          // Redirect to appropriate dashboard based on user role
          const redirectPath = getRedirectPath(user.role);
          navigate(redirectPath, { replace: true });
          return false;
        }
      }

      return true;
    };

    // Initial validation
    validatePermissions();

    // Add page visibility change listener to catch back button abuse
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Page became visible, re-validating permissions');
        validatePermissions();
      }
    };

    // Add beforeunload listener to clear sensitive data
    const handleBeforeUnload = () => {
      console.log('📤 Page unloading, clearing sensitive data');
      // Additional cleanup can be added here
    };

    // Add popstate listener to catch browser back/forward
    const handlePopState = (event) => {
      console.log('⬅️ Browser navigation detected, validating permissions');
      setTimeout(() => validatePermissions(), 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, isAuthenticated, location.pathname, requiredRole, navigate]);

  return {
    isValid: isAuthenticated && user && (requiredRole ? hasRole(user, [requiredRole]) : true)
  };
};

export default useSecurityCheck;
