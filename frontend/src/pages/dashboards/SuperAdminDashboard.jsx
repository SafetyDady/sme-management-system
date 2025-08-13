import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { 
  Shield, 
  Settings, 
  Users,
  Database,
  Activity,
  Lock,
  Server,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-pink-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          🛡️ SuperAdmin Dashboard - {user?.username}
        </h1>
        <p className="text-red-100 text-lg">
          System Administrator | Role: SuperAdmin | Maximum Access
        </p>
        <p className="text-red-200 text-sm mt-1">
          Complete system control, security, and technical administration
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Server className="h-8 w-8" />
              <span className="text-lg font-bold">Online</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-100">System Status</p>
            <p className="text-xs text-green-200">99.9% uptime</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Database className="h-8 w-8" />
              <span className="text-lg font-bold">Healthy</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100">Database Status</p>
            <p className="text-xs text-blue-200">Last backup: 2h ago</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-8 w-8" />
              <span className="text-lg font-bold">3</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-100">Alerts</p>
            <p className="text-xs text-orange-200">2 minor, 1 info</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8" />
              <span className="text-lg font-bold">247</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100">Active Sessions</p>
            <p className="text-xs text-purple-200">Peak: 312 today</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <CardTitle>Security Management</CardTitle>
            </div>
            <CardDescription>
              User access, permissions, and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <Lock className="mr-2 h-4 w-4" />
              Security Console
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              Create, modify, and manage all user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.location.href = '/users'}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-green-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-green-600" />
              <CardTitle>System Settings</CardTitle>
            </div>
            <CardDescription>
              Global system configuration and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              System Config
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-purple-600" />
              <CardTitle>Database Administration</CardTitle>
            </div>
            <CardDescription>
              Database management, backups, and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Database className="mr-2 h-4 w-4" />
              DB Console
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-orange-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-orange-600" />
              <CardTitle>System Monitor</CardTitle>
            </div>
            <CardDescription>
              Performance metrics and system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Monitor System
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-gray-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Server className="h-6 w-6 text-gray-600" />
              <CardTitle>Server Management</CardTitle>
            </div>
            <CardDescription>
              Server configuration and deployment tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Server className="mr-2 h-4 w-4" />
              Server Tools
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
