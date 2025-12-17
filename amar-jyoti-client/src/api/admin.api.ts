import apiClient from './client';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: {
    _id: string;
    name: string;
    stock: number;
    price: number;
  }[];
}

export interface Order {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  status: 'Pending' | 'Placed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  shippingAddress: {
    city: string;
  };
}

// Fetch Stats
export const fetchDashboardStats = async () => {
  const response = await apiClient.get<DashboardStats>('/admin/stats');
  return response.data;
};

// Fetch All Orders
export const fetchAllOrders = async (status?: string) => {
  const params = status ? `?status=${status}` : '';
  const response = await apiClient.get<Order[]>(`/admin/orders${params}`);
  return response.data;
};

// Update Order Status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};