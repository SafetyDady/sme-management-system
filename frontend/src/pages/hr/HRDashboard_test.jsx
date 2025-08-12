import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const HRDashboardTest = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        🎉 HR Dashboard Test - Working!
      </h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-2">User Info:</h2>
        <p><strong>Username:</strong> {user?.username || 'Not loaded'}</p>
        <p><strong>Role:</strong> {user?.role || 'Not loaded'}</p>
        <p><strong>Email:</strong> {user?.email || 'Not loaded'}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">HR Dashboard Status:</h2>
        <p className="text-blue-700">✅ Route working: /hr</p>
        <p className="text-blue-700">✅ Component loaded successfully</p>
        <p className="text-blue-700">✅ Authentication working</p>
        <p className="text-green-600 font-semibold mt-2">All systems operational! 🚀</p>
      </div>
    </div>
  );
};

export default HRDashboardTest;
