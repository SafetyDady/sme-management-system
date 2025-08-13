import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Wrench, Cog, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const EngineerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">⚙️ Engineer Dashboard - {user?.username}</h1>
        <p className="text-orange-100 text-lg">Technical Operations | Role: Engineer | System Maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Wrench className="h-6 w-6 text-orange-600" />
              <CardTitle>Maintenance Tasks</CardTitle>
            </div>
            <CardDescription>Equipment and system maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Wrench className="mr-2 h-4 w-4" />
              Maintenance Log
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <CardTitle>Issue Tracking</CardTitle>
            </div>
            <CardDescription>Track and resolve technical issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Issue Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <CardTitle>Technical Documentation</CardTitle>
            </div>
            <CardDescription>Engineering docs and specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Tech Docs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngineerDashboard;
