import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../../api/products.api';
import { useAppDispatch } from '../../store/hooks';
import { addToCartOptimistic } from '../../store/slices/cartSlice';
import apiClient from '../../api/client';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 1. SYNC TO SERVER
      await apiClient.post('/cart/add', {
        productId: product._id,
        quantity: 1
      });

      // 2. UPDATE REDUX
      dispatch(addToCartOptimistic({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      }));
      
      console.log("Added to cart:", product.name);
    } catch (error) {
      console.error("Failed to sync cart", error);
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="group block">
      {/* Used your .card and .card-hover classes */}
      <div className="card card-hover p-0 overflow-hidden h-full flex flex-col border border-subtle-text/10">
        
        {/* Image Container */}
        <div className="relative aspect-3/4 overflow-hidden bg-secondary/20">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>

          {/* Stock Badge */}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 bg-dark/80 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wider font-medium">
              Sold Out
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 flex flex-col grow">
          <p className="text-xs text-subtle-text mb-1 uppercase tracking-wider">
            {product.category?.name || 'Collection'}
          </p>
          
          {/* Used font-serif variable */}
          <h3 className="font-serif text-lg text-dark mb-1 truncate group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          
          <div className="mt-auto pt-2 flex items-center justify-between border-t border-subtle-text/10">
            <span className="font-medium text-dark text-lg">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            
            {product.stock > 0 && product.stock < 5 && (
              <span className="text-[10px] text-error font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;