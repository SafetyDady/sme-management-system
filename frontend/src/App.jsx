import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SuperAdminLayout from './components/SuperAdminLayout';
import AdminLayout from './components/AdminLayout';
import HRLayout from './components/HRLayout';
import { ConnectionVerification } from './components/ConnectionVerification';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import HRDashboard from './pages/hr/HRDashboard';
import { getRedirectPath } from './lib/auth';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Default redirect component
const DefaultRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, redirect based on role
  const redirectPath = getRedirectPath(user.role);
  return <Navigate to={redirectPath} replace />;
};

// Layout selector based on user role
const RoleBasedLayout = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) return <Layout>{children}</Layout>;
  
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
              
              {/* Protected Routes - Dashboard accessible to hr and above */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="hr">
                  <RoleBasedLayout>
                    <Dashboard />
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
                    <HRDashboard />
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
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
