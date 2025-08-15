import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">ระบบจัดการข้อมูลทั่วไป</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          ⚡ Administrator
        </Badge>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">
            👋 ยินดีต้อนรับ, {user?.username}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            คุณมีสิทธิ์ในการจัดการข้อมูลผู้ใช้และพนักงาน
          </p>
        </CardContent>
      </Card>

      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User-Employee Assignment */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <span className="text-2xl mr-3">👥</span>
              User-Employee Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              จัดการการเชื่อม User Account กับข้อมูล Employee
            </p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>• กำหนด User ID</span>
              <span>• จัดการสิทธิ์</span>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <span className="text-2xl mr-3">🔐</span>
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              จัดการบัญชีผู้ใช้ และสิทธิ์การเข้าถึง
            </p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>• สร้าง/แก้ไข User</span>
              <span>• กำหนด Role</span>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-900">
              <span className="text-2xl mr-3">⚙️</span>
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              ตั้งค่าระบบและการอนุมัติ
            </p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>• Role Configuration</span>
              <span>• System Logs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-gray-900">Create User</div>
              <div className="text-sm text-gray-500">สร้างผู้ใช้ใหม่</div>
            </button>

            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-medium text-gray-900">Link Employee</div>
              <div className="text-sm text-gray-500">เชื่อม User-Employee</div>
            </button>

            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">View Reports</div>
              <div className="text-sm text-gray-500">รายงานระบบ</div>
            </button>

            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-medium text-gray-900">Notifications</div>
              <div className="text-sm text-gray-500">การแจ้งเตือน</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">25</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Linked Employees</p>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Links</p>
                <p className="text-2xl font-bold text-orange-600">7</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
