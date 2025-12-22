import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllOrders, updateOrderStatus, type AdminOrder } from '../../api/admin.api';
import Loader from '../../components/common/Loader';
import { Eye, X, Package, MapPin, Smartphone } from 'lucide-react';

const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Placed': 'bg-blue-100 text-blue-800',
  'Packed': 'bg-indigo-100 text-indigo-800',
  'Shipped': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null); // For Modal

  // Fetch Orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => fetchAllOrders(),
  });

  // Update Status
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    }
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-serif text-dark">Order Management</h1>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium text-subtle-text">Order ID</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Customer</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Items</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Total</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Status</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Action</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-subtle-text">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-dark">
                        {order.user?.name || <span className="text-red-500 italic">Deleted User</span>}
                    </div>
                    <div className="text-xs text-subtle-text">
                        {order.user?.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-subtle-text">
                    {order.items?.length || 0} Items
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:border-accent outline-none cursor-pointer"
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
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors text-subtle-text hover:text-accent"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!orders || orders.length === 0) && (
          <div className="p-8 text-center text-subtle-text">No orders found.</div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-serif font-bold text-dark">Order Details</h2>
                <p className="text-sm text-subtle-text font-mono">#{selectedOrder._id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-red-50 text-subtle-text hover:text-red-500 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* 1. Products List */}
              <div>
                <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-accent" /> Ordered Items
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                        <img 
                          src={item.product?.images?.[0] || 'https://via.placeholder.com/50'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark">{item.product?.name || "Product Deleted"}</p>
                        <p className="text-sm text-subtle-text">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium text-dark">
                         ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Customer & Address Info */}
              <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                   <h3 className="font-bold text-dark mb-2 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-accent" /> Shipping Address
                   </h3>
                   <div className="text-sm text-subtle-text space-y-1">
                     <p className="font-medium text-dark">{selectedOrder.shippingAddress.street}</p>
                     <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                     <p>{selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.pincode}</p>
                   </div>
                </div>

                <div>
                   <h3 className="font-bold text-dark mb-2 flex items-center gap-2">
                     <Smartphone className="w-4 h-4 text-accent" /> Customer Details
                   </h3>
                   <div className="text-sm text-subtle-text space-y-1">
                     <p><span className="font-medium text-dark">Name:</span> {selectedOrder.user.name}</p>
                     <p><span className="font-medium text-dark">Email:</span> {selectedOrder.user.email}</p>
                     <p><span className="font-medium text-dark">Txn ID:</span> <span className="font-mono text-xs">{selectedOrder.paymentInfo?.transactionId || 'N/A'}</span></p>
                   </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-between items-center pt-4 border-t">
                 <span className="font-bold text-lg">Total Paid</span>
                 <span className="font-serif font-bold text-2xl text-accent">
                   ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                 </span>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 text-sm font-medium"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-4 py-2 bg-dark text-white rounded-md hover:bg-black text-sm font-medium"
              >
                Print Invoice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;