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
  ratings?: number;
  numOfReviews?: number;
  sizes?: string[]; 
  sizeDescription?: string;
  discount: number;
  salePrice: number;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string; // 'newest' | 'price_asc' | 'price_desc'
  search?: string; 
}

export interface Category {
  _id: string;
  name: string;
}

//  Fetch Products
export const fetchProducts = async (filters: ProductFilters): Promise<Product[]> => {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('min', filters.minPrice.toString());
  if (filters.maxPrice) params.append('max', filters.maxPrice.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.search) params.append('search', filters.search);

  // Note: We don't use <{ products: Product[] }> generic here because 
  // the wrapper is actually your ApiResponse object
  const response = await apiClient.get(`/products?${params.toString()}`);
  
  //  Access .data.data because  backend returns new ApiResponse(200, data, ...)
  return response.data.data || response.data; 
};

//  Fetch Single Product
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data.data || response.data; 
};

//  Fetch Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories');
  return response.data.data || response.data;
};