import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { 
  Building, 
  TrendingUp, 
  DollarSign,
  Users,
  Target,
  BarChart3,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          🏢 Director Dashboard - {user?.username}
        </h1>
        <p className="text-purple-100 text-lg">
          Executive Overview | Role: Director | Strategic Management
        </p>
        <p className="text-purple-200 text-sm mt-1">
          Complete organizational oversight and strategic decision making
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8" />
              <span className="text-2xl font-bold">₿12.5M</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-100">Revenue YTD</p>
            <p className="text-xs text-green-200">+15% vs last year</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8" />
              <span className="text-2xl font-bold">247</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100">Total Employees</p>
            <p className="text-xs text-blue-200">+12 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8" />
              <span className="text-2xl font-bold">94%</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-100">Target Achievement</p>
            <p className="text-xs text-orange-200">Q3 Performance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Building className="h-8 w-8" />
              <span className="text-2xl font-bold">8</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100">Active Projects</p>
            <p className="text-xs text-purple-200">2 critical phase</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <CardTitle>Strategic Analytics</CardTitle>
            </div>
            <CardDescription>
              Executive reports and strategic insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-green-600" />
              <CardTitle>Department Overview</CardTitle>
            </div>
            <CardDescription>
              All department performance and management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Building className="mr-2 h-4 w-4" />
              Manage Departments
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-purple-600" />
              <CardTitle>Executive Reports</CardTitle>
            </div>
            <CardDescription>
              Strategic planning and executive summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorDashboard;
