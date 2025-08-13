import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { ShoppingCart, Package, TrendingUp, FileText, Truck, DollarSign } from 'lucide-react';

const PurchasingDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🛒 Purchasing Dashboard - {user?.username}</h1>
        <p className="text-emerald-100 text-lg">Procurement | Role: Purchasing | Supply Chain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
              <CardTitle>Purchase Orders</CardTitle>
            </div>
            <CardDescription>Create and manage purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Manage Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Truck className="h-6 w-6 text-blue-600" />
              <CardTitle>Vendor Management</CardTitle>
            </div>
            <CardDescription>Supplier relationships and contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Truck className="mr-2 h-4 w-4" />
              Vendor Portal
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <CardTitle>Cost Analysis</CardTitle>
            </div>
            <CardDescription>Procurement analytics and cost tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Cost Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchasingDashboard;
