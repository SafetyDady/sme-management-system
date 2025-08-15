import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './components/DashboardRedirect';
import SecurityStatus from './components/SecurityStatus.jsx';
import Layout from './components/layouts/Layout';
import SuperAdminLayout from './components/layouts/SuperAdminLayout';
import AdminLayout from './components/layouts/AdminLayout';
import HRLayout from './components/layouts/HRLayout';
import { ConnectionVerification } from './components/ConnectionVerification';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import { UserManagement } from './features/user-management';
import EmployeeManagement from './features/employee-management/pages/EmployeeManagementFixed';
import { getRedirectPath } from './lib/auth';
// Import role-specific dashboards
import {
  DirectorDashboard,
  SuperAdminDashboard,
  ManagerDashboard,
  HRDashboard as HRDashboardNew,
  SupervisorDashboard,
  EngineerDashboard,
  PurchasingDashboard,
  StoreDashboard,
  AccountingDashboard,
  EmployeeDashboard,
  ClientDashboard
} from './pages/dashboards';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Default redirect component
const DefaultRedirect = () => {
  const { user, isLoading } = useAuth();
  
  console.log('🔀 DefaultRedirect - Auth state:', { user: !!user, isLoading });
  
  if (isLoading) {
    console.log('⏳ DefaultRedirect - Still loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, go to login
  if (!user) {
    console.log('🚫 DefaultRedirect - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, redirect based on role
  const redirectPath = getRedirectPath(user.role);
  console.log('✅ DefaultRedirect - User found, redirecting to:', redirectPath);
  return <Navigate to={redirectPath} replace />;
};

// Layout selector based on user role with security validation
const RoleBasedLayout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Security check - ensure user is still authenticated
  if (!isAuthenticated || !user) {
    console.log('🚨 RoleBasedLayout: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Log current user role for security auditing
  console.log('🔍 RoleBasedLayout: Current user role:', user.role);
  
  switch (user.role) {
    case 'superadmin':
      return <SuperAdminLayout>{children}</SuperAdminLayout>;
    case 'admin':
      return <AdminLayout>{children}</AdminLayout>;
    case 'hr':
      return <HRLayout>{children}</HRLayout>;
    default:
      return <Layout>{children}</Layout>;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-connection" element={<ConnectionVerification />} />
              
              {/* Protected Routes - Dashboard redirect to role-specific dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="hr">
                  <DashboardRedirect />
                </ProtectedRoute>
              } />
              
              {/* Role-specific Dashboard Routes */}
              <Route path="/director/dashboard" element={
                <ProtectedRoute requiredRole="director">
                  <RoleBasedLayout>
                    <DirectorDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/superadmin/dashboard" element={
                <ProtectedRoute requiredRole="superadmin">
                  <RoleBasedLayout>
                    <SuperAdminDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/manager/dashboard" element={
                <ProtectedRoute requiredRole="manager">
                  <RoleBasedLayout>
                    <ManagerDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/hr/dashboard" element={
                <ProtectedRoute requiredRole="hr">
                  <RoleBasedLayout>
                    <HRDashboardNew />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/supervisor/dashboard" element={
                <ProtectedRoute requiredRole="supervisor">
                  <RoleBasedLayout>
                    <SupervisorDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/engineer/dashboard" element={
                <ProtectedRoute requiredRole="engineer">
                  <RoleBasedLayout>
                    <EngineerDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/purchasing/dashboard" element={
                <ProtectedRoute requiredRole="purchasing">
                  <RoleBasedLayout>
                    <PurchasingDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/store/dashboard" element={
                <ProtectedRoute requiredRole="store">
                  <RoleBasedLayout>
                    <StoreDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/accounting/dashboard" element={
                <ProtectedRoute requiredRole="accounting">
                  <RoleBasedLayout>
                    <AccountingDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/employee/dashboard" element={
                <ProtectedRoute requiredRole="employee">
                  <RoleBasedLayout>
                    <EmployeeDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/client/dashboard" element={
                <ProtectedRoute requiredRole="client">
                  <RoleBasedLayout>
                    <ClientDashboard />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              {/* User Management - hr and above */}
              <Route path="/users" element={
                <ProtectedRoute requiredRole="hr">
                  <RoleBasedLayout>
                    <UserManagement />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <RoleBasedLayout>
                    <Profile />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              {/* HR Dashboard - admin, superadmin, and hr roles */}
              <Route path="/hr" element={
                <ProtectedRoute requiredRole="hr">
                  <RoleBasedLayout>
                    <HRDashboardNew />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              {/* HR Employee Management */}
              <Route path="/hr/employees" element={
                <ProtectedRoute requiredRole="hr">
                  <RoleBasedLayout>
                    <EmployeeManagement />
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/village" element={
                <ProtectedRoute requiredRole="superadmin">
                  <RoleBasedLayout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Village Management</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute requiredRole="superadmin">
                  <RoleBasedLayout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/system" element={
                <ProtectedRoute requiredRole="superadmin">
                  <RoleBasedLayout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </RoleBasedLayout>
                </ProtectedRoute>
              } />
              
              {/* Default redirect - Check authentication and redirect appropriately */}
              <Route path="/" element={<DefaultRedirect />} />
              
              {/* 404 fallback */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <a href="/login" className="text-primary hover:underline">
                      Go back to login
                    </a>
                  </div>
                </div>
              } />
            </Routes>
            
            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Toaster position="top-right" richColors />
            <SecurityStatus />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
