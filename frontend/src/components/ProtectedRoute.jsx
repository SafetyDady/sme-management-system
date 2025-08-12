import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { hasRole } from '../lib/auth';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasShownError, setHasShownError] = useState(false);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (!hasShownError) {
      toast.error('Please login to access this page');
      setHasShownError(true);
    }
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    console.log('🔐 Checking role access:', {
      requiredRole,
      userRole: user?.role,
      hasPermission: hasRole(user, [requiredRole])
    });
    
    if (!hasRole(user, [requiredRole])) {
      if (!hasShownError) {
        console.log('❌ Access denied for role:', user?.role, 'Required:', requiredRole);
        toast.error('Access denied. You do not have permission to view this page.');
        setHasShownError(true);
      }
      
      // Redirect based on user role
      const userRole = user?.role;
      if (userRole === 'user') {
        return <Navigate to="/profile" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  console.log('✅ Access granted for role:', user?.role);
  return children;
};

export default ProtectedRoute;

