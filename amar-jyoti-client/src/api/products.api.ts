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
  subcategory?: string;
}

// 1. New Response Interface (Matches Backend Structure)
export interface ProductsResponse {
  products: Product[];
  pagination: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

// 2. Updated Filters Interface with Pagination
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string; 
  search?: string; 
  subcategory?: string;
  page?: number;   
  limit?: number;  
}

export interface Category {
  _id: string;
  name: string;
}

// 3. Fetch Products (Returns ProductsResponse)
export const fetchProducts = async (filters: ProductFilters): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('min', filters.minPrice.toString());
  if (filters.maxPrice) params.append('max', filters.maxPrice.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.search) params.append('search', filters.search);
  if (filters.subcategory) params.append('subcategory', filters.subcategory);

  // Append Pagination Params
  params.append('page', (filters.page || 1).toString());
  params.append('limit', (filters.limit || 12).toString());

  const response = await apiClient.get(`/products?${params.toString()}`);
  
  // Return the data object which contains products array and pagination object
  return response.data.data; 
};

// Fetch Single Product
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data.data || response.data; 
};

// Fetch Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories');
  return response.data.data || response.data;
};