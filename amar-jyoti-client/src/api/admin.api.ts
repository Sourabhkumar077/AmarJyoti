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

// Detailed Order Interface for Admin
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

// Fetch Stats
export const fetchDashboardStats = async () => {
  const response = await apiClient.get<DashboardStats>("/admin/stats");
  return response.data;
};

// Fetch All Orders (Using new Type)
export const fetchAllOrders = async (status?: string) => {
  const params = status ? `?status=${status}` : "";
  const response = await apiClient.get<AdminOrder[]>(`/admin/orders${params}`);
  return response.data;
};

// Update Order Status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await apiClient.put(`/admin/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

// 1. Fetch Admin Products (Ideally returns ALL products, including hidden ones)
export const fetchAdminProducts = async () => {
  const response = await apiClient.get("/products");

  // Debug: See exactly what the server sends
  console.log("Admin Products Response:", response.data);

  // Handle different response structures
  if (Array.isArray(response.data)) {
    return response.data; // Server sent: [...]
  }

  if (response.data && Array.isArray(response.data.products)) {
    return response.data.products; // Server sent: { products: [...] }
  }

  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data; // Server sent: { data: [...] }
  }

  // Fallback: return empty array so UI doesn't crash
  return [];
};

// 2. Create Product
export const createProduct = async (productData: FormData | object) => {
  const response = await apiClient.post("/products", productData);
  return response.data;
};

// 3. Update Product (For Stock, Price, etc.)
export const updateProduct = async (
  id: string,
  productData: Partial<Product>
) => {
  const response = await apiClient.put(`/products/${id}`, productData);
  return response.data;
};

// 4. Delete Product
export const deleteProduct = async (id: string) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// 5. Upload Image Helper
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file); // Must match backend's upload.single('image')

  const response = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
