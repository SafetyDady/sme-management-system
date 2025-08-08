import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { systemAPI } from '../lib/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield,
  User,
  Activity,
  TrendingUp,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching dashboard data from backend...');
        const data = await systemAPI.getDashboard();
        console.log('📊 Dashboard data received:', data);
        // We don't need to store this data anymore since we use role-based rendering
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Just log the error, don't need to store fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // Different dashboard content based on user role
  const getDashboardContent = () => {
    const userRole = user?.role;
    console.log('🎨 Rendering dashboard for role:', userRole);
    
    switch(userRole) {
      case 'superadmin':
        return renderSuperAdminDashboard();
      case 'admin':
      case 'admin1':
      case 'admin2':
        return renderAdminDashboard();
      default:
        return renderUserDashboard();
    }
  };

  const renderSuperAdminDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          🔥 SuperAdmin Dashboard - {user?.username}
        </h1>
        <p className="text-purple-100">
          Full system access | Role: {user?.role} | Access Level: Maximum
        </p>
        <p className="text-purple-200 text-sm mt-1">
          Permissions: Full Control, User Management, System Settings
        </p>
      </div>

      {/* SuperAdmin Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <CardTitle className="text-white">User Management</CardTitle>
            </div>
            <CardDescription className="text-red-100">
              จัดการผู้ใช้ Admin, เพิ่ม/ลบ Admin และกำหนด Role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
              onClick={() => window.location.href = '/users'}
            >
              <Users className="mr-2 h-4 w-4" />
              จัดการผู้ใช้
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <CardTitle className="text-white">System Settings</CardTitle>
            </div>
            <CardDescription className="text-blue-100">
              ตั้งค่าระบบ, การรักษาความปลอดภัย
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
            >
              <Settings className="mr-2 h-4 w-4" />
              ตั้งค่าระบบ
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6" />
              <CardTitle className="text-white">Analytics</CardTitle>
            </div>
            <CardDescription className="text-green-100">
              ดูสถิติและรายงานระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              ดูสถิติ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          👨‍💼 Admin Dashboard - {user?.username}
        </h1>
        <p className="text-blue-100">
          Admin access | Role: {user?.role} | Access Level: Limited
        </p>
        <p className="text-blue-200 text-sm mt-1">
          Permissions: View Users, Basic Management
        </p>
      </div>

      {/* Admin Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <CardTitle className="text-white">View Users</CardTitle>
            </div>
            <CardDescription className="text-teal-100">
              ดูข้อมูลผู้ใช้ในระบบ (อ่านอย่างเดียว)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
              onClick={() => window.location.href = '/users'}
            >
              <Users className="mr-2 h-4 w-4" />
              ดูรายชื่อผู้ใช้
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6" />
              <CardTitle className="text-white">My Profile</CardTitle>
            </div>
            <CardDescription className="text-purple-100">
              จัดการโปรไฟล์ส่วนตัว
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
            >
              <User className="mr-2 h-4 w-4" />
              แก้ไขโปรไฟล์
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUserDashboard = () => (
    <div className="space-y-6">
      {/* User Welcome Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          👤 User Dashboard - {user?.username}
        </h1>
        <p className="text-green-100">
          User access | Role: {user?.role} | Access Level: Basic
        </p>
      </div>

      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <CardTitle className="text-white">My Profile</CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            จัดการโปรไฟล์ส่วนตัว
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
          >
            <User className="mr-2 h-4 w-4" />
            แก้ไขโปรไฟล์
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return getDashboardContent();
};

export default Dashboard;

