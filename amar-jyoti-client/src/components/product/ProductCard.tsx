import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCartAsync, addToCartLocal } from '../../store/slices/cartSlice';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Link click prevent karega
    e.stopPropagation();

    if (user) {
      // ✅ User Logged In -> Backend Call
      dispatch(addToCartAsync({ productId: product._id, quantity: 1 }));
      // Optional: Add Toast Notification here
    } else {
      // ✅ Guest User -> Local Storage
      // Backend jaisa structure bana rahe hain local ke liye
      dispatch(addToCartLocal({
        product: product, 
        productId: product._id,
        quantity: 1,
        _id: Date.now().toString() // Temp ID
      }));
      // Optional: Add Toast Notification here
      alert("Added to guest cart");
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-subtle-text/10 shadow-(--shadow-soft) hover:shadow-lg transition-all duration-300">
      {/* Image Link */}
      <Link to={`/product/${product._id}`} className="block relative aspect-4/5 overflow-hidden bg-gray-100">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-dark text-white text-xs px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">
           {typeof product.category === 'object' ? product.category.name : 'Ethnic Wear'}
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
};

export default ProductCard;