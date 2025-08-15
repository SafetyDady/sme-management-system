import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Calculator, PieChart, FileText, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

const AccountingDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">📊 Accounting Dashboard - {user?.username}</h1>
        <p className="text-cyan-100 text-lg">Financial Management | Role: Accounting | Books & Records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">₿8.2M</div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">₿3.4M</div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">₿4.8M</div>
            <p className="text-sm text-muted-foreground">Net Profit</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">₿2.1M</div>
            <p className="text-sm text-muted-foreground">Accounts Receivable</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-cyan-600" />
              <CardTitle>General Ledger</CardTitle>
            </div>
            <CardDescription>Chart of accounts and journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Manage Ledger
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <CardTitle>Financial Reports</CardTitle>
            </div>
            <CardDescription>P&L, Balance Sheet, Cash Flow</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <CardTitle>Accounts Payable</CardTitle>
            </div>
            <CardDescription>Vendor invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Manage Payables
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChart className="h-6 w-6 text-purple-600" />
              <CardTitle>Budget Analysis</CardTitle>
            </div>
            <CardDescription>Budget vs actual analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <PieChart className="mr-2 h-4 w-4" />
              Budget Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <CardTitle>Tax Management</CardTitle>
            </div>
            <CardDescription>Tax calculations and compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Tax Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-indigo-600" />
              <CardTitle>Payroll Integration</CardTitle>
            </div>
            <CardDescription>Employee compensation accounting</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              Payroll Accounting
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;
