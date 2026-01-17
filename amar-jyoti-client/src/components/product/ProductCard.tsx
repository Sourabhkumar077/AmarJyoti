import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { addToCartAsync } from '../../store/slices/cartSlice';
import LazyImage from '../common/LazyImage'; 

interface ProductCardProps {
  product: any;
}

const ProductCard = React.memo(({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Unified Logic: Works for both Guest and User automatically
    dispatch(addToCartAsync({ product: product, quantity: 1 }));
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-subtle-text/10 shadow-sm hover:shadow-lg transition-all duration-300">
      <Link to={`/product/${product._id}`} className="block relative aspect-4/5 overflow-hidden">
        <LazyImage 
          src={product.images?.[0] || '/placeholder.jpg'} 
          alt={product.name} 
          className="transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
            <span className="bg-dark text-white text-xs px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">
           {typeof product.category === 'object' ? product.category?.name : 'Ethnic Wear'}
        </p>
        <Link to={`/product/${product._id}`}>
          <h3 className="text-dark font-serif text-lg font-medium leading-tight mb-2 group-hover:text-accent transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-dark">₹{product.price.toLocaleString('en-IN')}</span>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-dark hover:bg-accent hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;