import apiClient from "./client";
import { type Product } from "./products.api";

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

export type ProductInput = Omit<Product, 'category' | '_id'> & {
  category: string;
};

export interface AdminOrder {
  _id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    product: {
      _id: string;
      name: string;
      images: string[];
      price: number;
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "Pending" | "Placed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  paymentInfo?: {
    transactionId: string;
    paymentId?: string;
  };
}

export const fetchDashboardStats = async () => {
  const response = await apiClient.get<DashboardStats>("/admin/stats");
  return response.data;
};

export const fetchAllOrders = async (status?: string) => {
  const response = await apiClient.get<AdminOrder[]>("/admin/orders", {
    params: { status }
  });
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await apiClient.put(`/admin/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

export const fetchAdminProducts = async ({ page = 1, limit = 10 }) => {
  const response = await apiClient.get("/products/admin/all", {
    params: { page, limit } 
  });
  return response.data.data; 
};

export const createProduct = async (productData: FormData | object) => {
  const response = await apiClient.post("/products", productData);
  return response.data;
};

export const updateProduct = async (
  id: string,
  productData: Partial<Product> | FormData
) => {
  const response = await apiClient.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/upload', formData);
  return response.data;
};