import apiClient from "./client";

export interface Review {
  _id: string;
  user: { _id: string; name: string };
  product: { _id: string; name: string; images: string[] };
  rating: number;
  comment: string;
  createdAt: string;
}

// Fetch Reviews for a Product
export const fetchProductReviews = async (productId: string) => {
  const response = await apiClient.get<Review[]>(`/reviews/product/${productId}`);
  return response.data;
};

// Add Review
export const addReview = async (productId: string, data: { rating: number, comment: string }) => {
  const response = await apiClient.post(`/reviews/product/${productId}`, data);
  return response.data;
};
// edit & update reviews
export const updateReview = async (reviewId: string, data: { rating: number, comment: string }) => {
  const response = await apiClient.put(`/reviews/${reviewId}`, data);
  return response.data;
};

// Get My Reviews
export const fetchMyReviews = async () => {
  const response = await apiClient.get<Review[]>('/reviews/my-reviews');
  return response.data;
};

// Delete Review
export const deleteReview = async (reviewId: string) => {
  const response = await apiClient.delete(`/reviews/${reviewId}`);
  return response.data;
};