import apiClient from './client';

export interface Order {
  _id: string;
  totalAmount: number;
  status: 'Pending' | 'Placed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  items: {
    product: {
      name: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }[];
  paymentInfo: {
    razorpayPaymentId?: string;
  };
}

// Fetch orders for the logged-in user
export const fetchMyOrders = async () => {
  // Assuming your backend has this endpoint. If not, we might need to use a filter on GET /orders
  // But usually, standard practice is GET /orders/myorders
  const response = await apiClient.get<Order[]>('/orders/myorders'); 
  return response.data;
};