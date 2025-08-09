import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { ConnectionVerification } from './components/ConnectionVerification';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

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
              
              {/* Protected Routes - Dashboard accessible to admin and above */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* User Management - admin and above */}
              <Route path="/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/village" element={
                <ProtectedRoute requiredRole="superadmin">
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Village Management</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute requiredRole="superadmin">
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/system" element={
                <ProtectedRoute requiredRole="superadmin">
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Default redirect - Always check authentication first */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } />
              
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
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
