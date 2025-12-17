import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag, IndianRupee, AlertTriangle } from 'lucide-react';
import { fetchDashboardStats } from '../../api/admin.api';
import Loader from '../../components/common/Loader';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif text-dark">Business Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subtle-text text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
            <div className="p-2 bg-green-50 rounded-full text-green-600"><IndianRupee className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-dark">₹{stats?.totalRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subtle-text text-sm font-medium uppercase tracking-wider">Total Orders</h3>
            <div className="p-2 bg-blue-50 rounded-full text-blue-600"><ShoppingBag className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-dark">{stats?.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subtle-text text-sm font-medium uppercase tracking-wider">Active Users</h3>
            <div className="p-2 bg-purple-50 rounded-full text-purple-600"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-dark">{stats?.totalUsers}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-white border border-red-100 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-6 py-4 flex items-center border-b border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-700">Low Stock Alerts</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.lowStockProducts.map((prod) => (
              <div key={prod._id} className="px-6 py-4 flex justify-between items-center">
                <span className="text-dark font-medium">{prod.name}</span>
                <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
                  {prod.stock} remaining
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;