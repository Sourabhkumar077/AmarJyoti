import apiClient from './client';

// Define the interface matching your Backend Model exactly
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: 'Saree' | 'Suit' | 'Lehenga';
  };
  price: number;
  stock: number;
  fabric: string;
  colors: string[];
  images: string[];
  isActive: boolean;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string; // 'newest' | 'price_asc' | 'price_desc'
}
export interface Category {
  _id: string;
  name: string;
}

export const fetchProducts = async (filters: ProductFilters): Promise<Product[]> => {
  // Build query string manually or using URLSearchParams
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('min', filters.minPrice.toString());
  if (filters.maxPrice) params.append('max', filters.maxPrice.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);

  // Calls: http://localhost:5000/api/v1/products?category=Saree&...
  const response = await apiClient.get<{ products: Product[] }>(`/products?${params.toString()}`);
  
  return response.data.products;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};

// to fetch categories
export const fetchCategories = async () => {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
};