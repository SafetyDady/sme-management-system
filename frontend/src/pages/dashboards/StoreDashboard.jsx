import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Store, Package, BarChart3, Users, ShoppingBag, TrendingUp } from 'lucide-react';

const StoreDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🏪 Store Dashboard - {user?.username}</h1>
        <p className="text-purple-100 text-lg">Retail Operations | Role: Store | Customer Service</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-purple-600" />
              <CardTitle>Inventory</CardTitle>
            </div>
            <CardDescription>Stock levels and product management</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Package className="mr-2 h-4 w-4" />
              Manage Inventory
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-green-600" />
              <CardTitle>Sales Tracking</CardTitle>
            </div>
            <CardDescription>Daily sales and transaction records</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Sales Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>Customer Service</CardTitle>
            </div>
            <CardDescription>Customer inquiries and support</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Customer Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreDashboard;
