import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ShoppingBag, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import { fetchProductById } from '../api/products.api';
import { useAppDispatch } from '../store/hooks';
import { addToCartOptimistic } from '../store/slices/cartSlice';
import Loader from '../components/common/Loader';
import apiClient from '../api/client';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Local UI State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // 1. Fetch Product Data
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id, // Only fetch if ID exists
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  // 2. Handlers
  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = quantity + delta;
    // Prevent going below 1 or above available stock
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart =  async () => {
    if (!product) return;

    setIsAdding(true);
    
    try {
    // 1. SYNC TO SERVER (The missing piece)
    await apiClient.post('/cart/add', {
      productId: product._id,
      quantity: quantity
    });

    // 2. UPDATE REDUX UI
    dispatch(addToCartOptimistic({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity
    }));

    // Success feedback
    setIsAdding(false);
  } catch (error) {
    console.error("Failed to add to cart:", error);
    setIsAdding(false);
    // Optional: alert("Could not add to cart");
  }
  };

  // 3. Render States
  if (isLoading) return <Loader />;

  if (isError || !product) {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-2xl font-serif text-dark mb-4">Product Not Found</h2>
        <p className="text-subtle-text mb-6">The item you are looking for might have been removed or does not exist.</p>
        <Link to="/products" className="btn-primary inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-primary/30">
      <div className="container">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm text-subtle-text hover:text-accent mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Back to Collection
        </button>

        <div className="bg-light rounded-xl shadow-(--shadow-soft) p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-3/4 bg-secondary/10 rounded-lg overflow-hidden relative">
              <img 
                src={product.images[selectedImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              {product.stock === 0 && (
                 <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-dark text-white px-6 py-2 uppercase tracking-widest font-bold">Sold Out</span>
                 </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx ? 'border-accent ring-2 ring-accent/20' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col">
            <div className="mb-1">
              <span className="text-accent text-xs font-bold tracking-widest uppercase bg-accent/10 px-2 py-1 rounded-sm">
                {product.category?.name || 'Exclusive'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-3 mb-6 pb-6 border-b border-subtle-text/10">
              <span className="text-3xl font-medium text-dark">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-subtle-text mb-1">
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-subtle-text mb-8">
              <p className="leading-relaxed">{product.description}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4 bg-primary/20 p-4 rounded-lg">
                <div>
                  <span className="block text-xs font-bold text-dark uppercase tracking-wider mb-1">Fabric</span>
                  <span className="text-sm text-dark">{product.fabric}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-dark uppercase tracking-wider mb-1">Colors</span>
                  <div className="flex gap-1">
                    {product.colors.map((c, i) => (
                      <span key={i} className="text-sm text-dark bg-white px-2 py-0.5 rounded border border-subtle-text/10">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Controls */}
            {product.stock > 0 ? (
              <div className="mt-auto space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center gap-6">
                  <span className="font-medium text-dark">Quantity</span>
                  <div className="flex items-center border border-subtle-text/30 rounded-full bg-white">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 hover:text-accent disabled:opacity-30 transition-colors"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium tabular-nums">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 hover:text-accent disabled:opacity-30 transition-colors"
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {product.stock < 5 && (
                    <span className="text-xs text-error font-medium bg-error/10 px-2 py-1 rounded-full animate-pulse">
                      Only {product.stock} left!
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`w-full md:w-auto btn-primary flex items-center justify-center gap-3 min-w-60 shadow-lg shadow-accent/20 ${isAdding ? 'opacity-90 cursor-wait' : ''}`}
                >
                  {isAdding ? (
                    'Adding to Cart...'
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-auto bg-subtle-text/10 p-4 rounded-lg text-center text-subtle-text">
                Currently out of stock. <br/>
                <span className="text-sm">Please check back later.</span>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-subtle-text/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-full text-accent">
                   <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs text-subtle-text font-medium">Free Shipping<br/>On orders over ₹1999</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-full text-accent">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-subtle-text font-medium">Secure Payment<br/>Razorpay Verified</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;