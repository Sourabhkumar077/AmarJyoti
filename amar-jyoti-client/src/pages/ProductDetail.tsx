import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Star, Trash2,  Edit3, Ruler, Check, ShieldCheck } from 'lucide-react';
import { fetchProductById } from '../api/products.api';
import { fetchProductReviews, addReview, deleteReview, updateReview } from '../api/reviews.api';
import apiClient from '../api/client'; 
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCartAsync } from '../store/slices/cartSlice'; 
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import SizeChartModal from '../components/product/SizeChartModal';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const { data: userOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/my-orders');
      return res.data.data;
    },
    enabled: !!user,
  });

  const canReview = useMemo(() => {
    if (!userOrders || !id) return false;
    return userOrders.some((order: any) => 
      order.status === 'Delivered' && 
      order.items.some((item: any) => (item.product?._id || item.product) === id)
    );
  }, [userOrders, id]);

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchProductReviews(id!),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data: { rating: number, comment: string }) => addReview(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setComment(''); setRating(5);
      toast.success("Review added successfully! 🎉");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add review")
  });

  const updateMutation = useMutation({
    mutationFn: (data: { rating: number, comment: string }) => updateReview(editingReviewId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setComment(''); setRating(5); setEditingReviewId(null);
      toast.success("Review updated successfully! ✏️");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success("Review deleted successfully.");
    }
  });

  const handleAddToCart = () => {
    if (product) {
      if (product.stock <= 0) { toast.error("This product is currently out of stock."); return; }
      if (product.sizes?.length && !selectedSize) { toast.error("Please select a size first!"); return; }
      if (product.colors?.length && !selectedColor) { toast.error("Please select a color first!"); return; }
      
      dispatch(addToCartAsync({ product, quantity: 1, size: selectedSize, color: selectedColor }));
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    editingReviewId ? updateMutation.mutate({ rating, comment }) : createMutation.mutate({ rating, comment });
  };

  const handleEditClick = (rev: any) => {
    setRating(rev.rating); setComment(rev.comment); setEditingReviewId(rev._id);
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (productLoading) return <Loader />;
  if (!product) return <div className="text-center py-20 font-serif text-xl">Product not found</div>;

  return (
    <>
      <div className="bg-primary/5 min-h-screen py-10">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Main Product Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-2xl shadow-sm mb-12 border border-gray-100">
            {/* Left: Product Gallery */}
            <div className="space-y-4">
              <div className="aspect-3/4 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)} 
                    className={`w-20 h-24 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${selectedImage === idx ? 'border-accent shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-serif text-dark mb-2">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-accent">₹{product.salePrice.toLocaleString('en-IN')}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded border border-red-100">{product.discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{product.description}</p>

              {product.sizes && product.sizes.length > 0 && (
                <div className="py-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-dark uppercase tracking-wider text-sm">Select Size</span>
                    <button onClick={() => setIsSizeChartOpen(true)} className="text-xs text-accent hover:text-dark flex items-center gap-1.5 transition-colors font-medium">
                      <Ruler className="w-4 h-4" /> SIZE GUIDE
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size: string) => (
                      <button 
                        key={size} 
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12.5 h-11 px-4 rounded-lg border text-sm font-medium transition-all ${selectedSize === size ? 'bg-dark text-white border-dark shadow-lg scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-dark'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="py-4 border-t border-gray-100">
                  <p className="font-semibold text-dark uppercase tracking-wider text-sm mb-4">Select Color: <span className="text-accent font-normal capitalize ml-2">{selectedColor}</span></p>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((color: string) => (
                      <button 
                        key={color} 
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-dark scale-110 ring-2 ring-offset-2 ring-dark' : 'border-gray-200 hover:scale-105'}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                      >
                        {selectedColor === color && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <button onClick={handleAddToCart} className="w-full py-4 bg-dark text-white rounded-xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98]">
                  <ShoppingCart className="w-5 h-5" /> ADD TO CART
                </button>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-serif font-bold text-dark mb-10">Customer Reviews</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Reviews List */}
              <div className="space-y-8 max-h-150 overflow-y-auto pr-4 custom-scrollbar">
                {reviewsLoading ? <Loader /> : reviews?.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  reviews?.map((rev: any) => (
                    <div key={rev._id} className="border-b border-gray-50 pb-8 last:border-0 relative">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-lg">
                          {rev.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-dark">{rev.user?.name}</p>
                          <div className="flex text-yellow-400 gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString('en-GB')}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed pl-16">{rev.comment}</p>
                      
                      {user?._id === rev.user?._id && (
                        <div className="absolute top-0 right-0 flex gap-2">
                          <button onClick={() => handleEditClick(rev)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => deleteMutation.mutate(rev._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Review Form Area */}
              <div id="review-form" className="h-fit sticky top-24">
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                  <h3 className="text-xl font-bold text-dark mb-6">{editingReviewId ? 'Edit Your Review' : 'Share Your Thoughts'}</h3>
                  
                  {!user ? (
                     <div className="text-center py-4">
                       <p className="text-gray-500 mb-4 text-sm">Please sign in to write a review.</p>
                       <Link to="/login" className="inline-block px-6 py-2 border-2 border-accent text-accent font-bold rounded-lg hover:bg-accent hover:text-white transition-all">SIGN IN</Link>
                     </div>
                  ) : canReview ? (
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100/50 text-green-700 rounded-lg text-xs font-bold border border-green-200 w-fit">
                        <ShieldCheck className="w-4 h-4" /> VERIFIED PURCHASE
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Rating</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(s => (
                            <button type="button" key={s} onClick={() => setRating(s)} className={`transition-transform hover:scale-125 ${rating >= s ? 'text-yellow-400' : 'text-gray-200'}`}>
                              <Star className={`w-8 h-8 ${rating >= s ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Experience</label>
                        <textarea required value={comment} onChange={e => setComment(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl bg-white min-h-30 focus:border-accent outline-none text-sm transition-all shadow-sm" placeholder="Tell us about the quality, fit, and style..."></textarea>
                      </div>
                      <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-accent/20 hover:bg-dark transition-all disabled:opacity-50">
                        {editingReviewId ? 'UPDATE REVIEW' : 'SUBMIT REVIEW'}
                      </button>
                    </form>
                  ) : (
                    <div className="p-6 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                      <p className="text-sm text-gray-600 font-medium">Reviews are only available to verified customers who have received the product.</p>
                      <p className="text-xs text-gray-400 mt-3">Your order status must be 'Delivered' to leave feedback.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} category={product.category?.name || 'Suit'} />
    </>
  );
};

export default ProductDetail;