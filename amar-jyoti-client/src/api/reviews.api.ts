import apiClient from "./client";

export interface Review {
  _id: string;
  user: { _id: string; name: string };
  product: { _id: string; name: string; images: string[] };
  rating: number;
  comment: string;
  createdAt: string;
}

// Helper interface for Backend Response Structure
interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// 1. Fetch Reviews for a Product
export const fetchProductReviews = async (productId: string) => {
  // We define the return type as ApiResponse containing Review[]
  const response = await apiClient.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`);
  
  // ✅ THE FIX: Return response.data.data (The Array) instead of response.data (The Wrapper)
  return response.data.data; 
};

// 2. Add Review
export const addReview = async (productId: string, data: { rating: number, comment: string }) => {
  const response = await apiClient.post<ApiResponse<Review>>(`/reviews/product/${productId}`, data);
  return response.data.data;
};

// 3. Edit & Update Review
export const updateReview = async (reviewId: string, data: { rating: number, comment: string }) => {
  const response = await apiClient.put<ApiResponse<Review>>(`/reviews/${reviewId}`, data);
  return response.data.data;
};

// 4. Get My Reviews
export const fetchMyReviews = async () => {
  const response = await apiClient.get<ApiResponse<Review[]>>('/reviews/my-reviews');
  return response.data.data;
};

// 5. Delete Review
export const deleteReview = async (reviewId: string) => {
  const response = await apiClient.delete<ApiResponse<null>>(`/reviews/${reviewId}`);
  return response.data.data;
};

// 6. Admin Fetch All Reviews
export const fetchAllReviews = async () => {
  const response = await apiClient.get<ApiResponse<any[]>>('/reviews/admin/all');
  return response.data.data;
};