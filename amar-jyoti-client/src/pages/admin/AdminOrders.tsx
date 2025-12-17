import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllOrders, updateOrderStatus } from '../../api/admin.api';
import Loader from '../../components/common/Loader';

const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Placed': 'bg-blue-100 text-blue-800',
  'Shipped': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => fetchAllOrders(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    }
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-dark">Order Management</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium text-subtle-text">Order ID</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Customer</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Amount</th>
                <th className="px-6 py-4 font-medium text-subtle-text">City</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Status</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-subtle-text">{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-dark">{order.user.name}</div>
                    <div className="text-xs text-subtle-text">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-subtle-text">{order.shippingAddress.city}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-accent outline-none"
                      value={order.status}
                      disabled={updateMutation.isPending}
                      onChange={(e) => updateMutation.mutate({ id: order._id, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Placed">Placed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders?.length === 0 && (
          <div className="p-8 text-center text-subtle-text">No orders found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;