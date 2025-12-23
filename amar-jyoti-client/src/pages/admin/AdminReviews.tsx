import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllReviews, deleteReview } from '../../api/reviews.api';
import Loader from '../../components/common/Loader';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();

  // 1. Fetch All Reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: fetchAllReviews,
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success("Review Deleted Successfully");
    },
    onError: () => toast.error("Failed to delete review")
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-dark">Reviews Management</h1>
        <div className="bg-white px-4 py-2 rounded-lg border text-sm font-medium">
          Total Reviews: {reviews?.length || 0}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium text-subtle-text">Product</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Customer</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Rating</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Comment</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Date</th>
                <th className="px-6 py-4 font-medium text-subtle-text">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews?.map((review: any) => (
                  <tr key={review._id} className="hover:bg-gray-50 transition-colors group">
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                          <img 
                            src={review.product?.images?.[0] || 'https://via.placeholder.com/40'} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className="font-medium text-dark line-clamp-1 w-32" title={review.product?.name}>
                          {review.product?.name || <span className="text-red-400 italic">Deleted Product</span>}
                        </span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div className="text-dark font-medium">{review.user?.name || "Unknown"}</div>
                      <div className="text-xs text-subtle-text">{review.user?.email}</div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-gray-600 line-clamp-2" title={review.comment}>
                        "{review.comment}"
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-subtle-text whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          if(confirm("Are you sure you want to delete this review?")) {
                            deleteMutation.mutate(review._id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;