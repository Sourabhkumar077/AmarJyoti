import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Star, Trash2, User, Edit3 } from 'lucide-react';
import { fetchProductById } from '../api/products.api';
import { fetchProductReviews, addReview, deleteReview, updateReview } from '../api/reviews.api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCartLocal, addToCartAsync } from '../store/slices/cartSlice';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Fetch Product
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  // Fetch Reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchProductReviews(id!),
    enabled: !!id,
  });

  // Create Review Mutation
  const createMutation = useMutation({
    mutationFn: (data: { rating: number, comment: string }) => {
      if (!id) throw new Error("Product ID is missing"); // 🛡️ Safety Check
      return addReview(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] }); // Refresh avg rating
      setComment('');
      setRating(5);
      toast.success("Review added successfully! 🎉");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add review")
  });

  // Update Review Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { rating: number, comment: string }) => updateReview(editingReviewId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setComment('');
      setRating(5);
      setEditingReviewId(null); // Exit edit mode
      toast.success("Review updated successfully! ✏️");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update review")
  });

  // Delete Review Mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success("Review deleted.");
    },
    onError: () => toast.error("Could not delete review.")
  });

  const handleAddToCart = () => {
    if (product) {
      if (product.stock <= 0) {
        toast.error("This product is currently out of stock.");
        return;
      }

      if (user) {
        //  Use 'product' directly (was productObject which caused crash)
        dispatch(addToCartAsync({ product: product, quantity: 1 }));
      } else {
        dispatch(addToCartLocal({ productId: product._id, quantity: 1, product: product }));
      }


    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id) {
      toast.error("Error: Product ID missing");
      return;
    }

    if (editingReviewId) {
      updateMutation.mutate({ rating, comment });
    } else {
      createMutation.mutate({ rating, comment });
    }
  };

  // Populate Form for Editing
  const handleEditClick = (rev: any) => {
    setRating(rev.rating);
    setComment(rev.comment);
    setEditingReviewId(rev._id);
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment('');
  };

  if (productLoading) return <Loader />;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="bg-primary/10 min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-8">

        {/* Product Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 rounded-xl shadow-sm mb-10">
          <div className="space-y-4">
            <div className="aspect-3/4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-20 h-20 rounded-md overflow-hidden border-2 shrink-0 ${selectedImage === idx ? 'border-accent' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-serif text-dark">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (product.ratings || 0) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-subtle-text">({product.numOfReviews || 0} Reviews)</span>
            </div>
            <p className="text-2xl font-bold text-accent">₹{product.price.toLocaleString('en-IN')}</p>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
            <div className="pt-6 border-t border-gray-100">
              <button onClick={handleAddToCart} className="w-full md:w-auto px-8 py-3 bg-dark text-white rounded-md hover:bg-black transition flex items-center justify-center gap-2 shadow-lg">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-subtle-text/10">
          <h2 className="text-2xl font-serif font-bold text-dark mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Reviews List */}
            {/* Reviews List */}
            <div className="space-y-6 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
              {reviewsLoading ? <Loader /> : reviews?.length === 0 ? (
                <p className="text-subtle-text italic">No reviews yet. Be the first to review!</p>
              ) : (
                reviews?.map((rev: any) => (
                  <div key={rev._id} className={`border-b border-gray-100 pb-6 last:border-0 relative group transition-colors ${editingReviewId === rev._id ? 'bg-accent/5 p-4 rounded-lg' : ''}`}>

                    {/* 👇 DEBUG: This will show you exactly why the condition fails. Remove after fixing.
                    <div className="bg-yellow-100 text-xs p-2 mb-2 rounded border border-yellow-300 font-mono text-black">
                      <p><strong>My ID:</strong> {user?._id || "Not Logged In"}</p>
                      <p><strong>Reviewer ID:</strong> {rev.user?._id || "Unknown"}</p>
                      <p><strong>Match?</strong> {user?._id === rev.user?._id ? "✅ YES" : "❌ NO"}</p>
                    </div> */}

                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                        {rev.user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-dark">{rev.user?.name || "Anonymous"}</p>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-subtle-text">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-12">{rev.comment}</p>

                    {/* 👇 FIXED ACTION BUTTONS (Always Visible & Debugged) */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      {/* EDIT BUTTON */}
                      {user?._id === rev.user?._id && (
                        <button
                          onClick={() => handleEditClick(rev)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 border border-blue-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* DELETE BUTTON */}
                      {(user?.role === 'admin' || user?._id === rev.user?._id) && (
                        <button
                          onClick={() => { if (confirm("Delete this review?")) deleteMutation.mutate(rev._id); }}
                          className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 border border-red-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Review Form */}
            <div className="h-fit sticky top-24">
              <div id="review-form" className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-dark">{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h3>
                  {editingReviewId && (
                    <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
                  )}
                </div>

                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-4">Please login to write a review.</p>
                    <button onClick={() => navigate('/login')} className="text-accent underline font-medium">Login Now</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Your Comment</label>
                      <textarea
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border rounded-md focus:border-accent outline-none min-h-25"
                        placeholder="How was the product quality and fit?"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="w-full bg-accent text-white py-2 rounded-md hover:bg-yellow-600 transition shadow-md disabled:opacity-70"
                    >
                      {editingReviewId
                        ? (updateMutation.isPending ? 'Updating...' : 'Update Review')
                        : (createMutation.isPending ? 'Submitting...' : 'Submit Review')
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;