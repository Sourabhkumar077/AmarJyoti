import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate add kiya
import { useQuery } from '@tanstack/react-query';
import { Star, ShoppingCart, Truck, RefreshCw, ShieldCheck, Minus, Plus, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import Loader from '../components/common/Loader';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCartAsync, addToCartLocal } from '../store/slices/cartSlice';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // Safety: Agar ID nahi hai to error phenko
      if (!id) throw new Error("Invalid Product ID");
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id, // Jab tak ID na mile, query mat चलाओ
  });

  const handleAddToCart = () => {
    if (!product) return;

    if (user) {
      // Logged In User
      dispatch(addToCartAsync({ productId: product._id, quantity }));
      // Optional: Toast message show karo
    } else {
      // Guest User
      dispatch(addToCartLocal({
        product: product,
        productId: product._id,
        quantity: quantity,
        _id: Date.now().toString()
      }));
      // Optional: Toast message show karo
    }
    // UX: Cart me add hone ke baad user ko feedback do
    alert("Item added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (isLoading) return <Loader />;

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-subtle-text" />
        <h2 className="text-xl font-serif text-dark">Product not found</h2>
        <button onClick={() => navigate('/products')} className="text-accent hover:underline">
          Browse all products
        </button>
      </div>
    );
  }

  // Safety check for images
  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  return (
    <div className="bg-primary/30 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-3/4 rounded-xl overflow-hidden bg-gray-100 relative group">
              <img 
                src={images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 shrink-0 rounded-md overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-accent' : 'border-transparent hover:border-subtle-text/30'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full">
            <div className="mb-1">
              <span className="text-sm font-medium text-accent tracking-wider uppercase">
                {product.category?.name || 'Ethnic Wear'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-dark">₹{product.price?.toLocaleString('en-IN')}</span>
              {/* Fake Rating for UI */}
              <div className="flex items-center gap-1 text-yellow-500 text-sm bg-yellow-50 px-2 py-1 rounded">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">4.8</span>
                <span className="text-subtle-text ml-1">(120 Reviews)</span>
              </div>
            </div>

            <p className="text-subtle-text mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity & Actions */}
            <div className="space-y-6 mt-auto">
              <div className="flex items-center gap-4">
                <span className="font-medium text-dark">Quantity:</span>
                <div className="flex items-center border border-subtle-text/20 rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-subtle-text">
                  {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="btn-secondary py-4 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="btn-primary py-4 flex items-center justify-center gap-2"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-subtle-text/10">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-dark">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-dark">Easy Returns</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-dark">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;