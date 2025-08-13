import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Eye, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';

const SupervisorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🔍 Supervisor Dashboard - {user?.username}</h1>
        <p className="text-teal-100 text-lg">Quality Control | Role: Supervisor | Team Oversight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-teal-600" />
              <CardTitle>Quality Control</CardTitle>
            </div>
            <CardDescription>Monitor work quality and standards</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Quality Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Task Approval</CardTitle>
            </div>
            <CardDescription>Review and approve team tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Tasks
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <CardTitle>Safety Oversight</CardTitle>
            </div>
            <CardDescription>Monitor safety compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Safety Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
