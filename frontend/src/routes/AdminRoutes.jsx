import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPanel from '../components/admin/AdminPanel';

const AdminRoutes = () => {
  const { user } = useAuth();

  // Check if user has admin access
  if (!user || !['superadmin', 'system_admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminPanel />} />
    </Routes>
  );
};

export default AdminRoutes;
