import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  TrendingUp, 
  Users, 
  Building, 
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { api } from '@/lib/api';

const HRReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hr/reports/summary');
      setReportData(response.data);
    } catch (err) {
      setError('Failed to load report data');
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await api.get(`/api/hr/reports/export?format=${format}&period=${selectedPeriod}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `hr-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchReportData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { 
    total_employees, 
    active_employees, 
    inactive_employees,
    department_breakdown,
    employment_type_breakdown,
    recent_activities,
    growth_metrics
  } = reportData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">HR Reports</h1>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button onClick={() => exportReport('csv')} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => exportReport('xlsx')} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_employees || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{active_employees || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactive_employees || 0}</div>
            <p className="text-xs text-muted-foreground">
              Not currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {total_employees > 0 ? Math.round((active_employees / total_employees) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Employee activity rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {department_breakdown?.map((dept, index) => {
                const percentage = total_employees > 0 ? ((dept.count / total_employees) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {dept.department || 'Unassigned'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{dept.count} employees</span>
                        <Badge variant="secondary">{percentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {(!department_breakdown || department_breakdown.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No department data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Employment Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employment_type_breakdown?.map((type, index) => {
                const percentage = total_employees > 0 ? ((type.count / total_employees) * 100).toFixed(1) : 0;
                const colors = ['bg-green-600', 'bg-blue-600', 'bg-yellow-600', 'bg-purple-600'];
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{type.employment_type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{type.count} employees</span>
                        <Badge variant="secondary">{percentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {(!employment_type_breakdown || employment_type_breakdown.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No employment type data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activities (Last {selectedPeriod} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent_activities?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant={activity.type === 'created' ? 'default' : 'secondary'}>
                  {activity.type}
                </Badge>
              </div>
            ))}
            {(!recent_activities || recent_activities.length === 0) && (
              <p className="text-gray-500 text-center py-4">
                No recent activities found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      {growth_metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{growth_metrics.new_hires || 0}
                </div>
                <p className="text-sm text-gray-600">New Hires</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  -{growth_metrics.departures || 0}
                </div>
                <p className="text-sm text-gray-600">Departures</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${(growth_metrics.net_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(growth_metrics.net_growth || 0) >= 0 ? '+' : ''}{growth_metrics.net_growth || 0}
                </div>
                <p className="text-sm text-gray-600">Net Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchReportData} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default HRReports;
