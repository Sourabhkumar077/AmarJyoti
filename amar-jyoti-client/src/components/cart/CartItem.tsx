import React, { useState } from 'react';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react'; 
import { useAppDispatch } from '../../store/hooks';
import {
  updateCartItemAsync,
  removeFromCartAsync
} from '../../store/slices/cartSlice';

interface CartItemProps {
  item: any;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  
  // Local loading state for granular UI feedback
  const [isItemLoading, setIsItemLoading] = useState(false);

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1 || isItemLoading) return; 

    setIsItemLoading(true);
    try {
      // Unified Async Call (Backend handles Guest vs User)
      await dispatch(updateCartItemAsync({
        productId: item.productId,
        quantity: newQty
      })).unwrap();
    } catch (error) {
      console.error("Failed to update quantity", error);
    } finally {
      setIsItemLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isItemLoading) return; 

    setIsItemLoading(true);
    try {
      // Unified Async Call
      const idToSend = item.productId || item.product._id;
      await dispatch(removeFromCartAsync({
          id: idToSend, 
          size: item.size, 
          color: item.color
      })).unwrap();
    } catch (error) {
      console.error("Failed to remove item", error);
      setIsItemLoading(false); // Only stop loading if it failed (if success, item disappears)
    }
  };

  return (
    <div 
      className={`flex gap-4 py-4 border-b border-subtle-text/10 transition-all duration-200 ${
        isItemLoading ? 'opacity-60 bg-gray-50' : ''
      }`}
    >
      <div className="w-24 h-32 shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
        <img
          src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
          alt={item.product?.name}
          className="w-full h-full object-cover"
        />
        {/* Overlay Spinner on Image */}
        {isItemLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="w-6 h-6 animate-spin text-dark" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-serif text-dark text-lg">{item.product?.name}</h3>
            
            <button
              onClick={handleRemove}
              disabled={isItemLoading}
              className="text-subtle-text hover:text-error transition-colors disabled:cursor-not-allowed p-1"
            >
              {isItemLoading ? (
                 <Loader2 className="w-5 h-5 animate-spin text-dark" />
              ) : (
                 <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-sm text-subtle-text mt-1">
            {item.product?.category?.name || 'Ethnic Wear'}
          </p>

          {item.size && (
            <span className="text-xs font-medium text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">
              Size: {item.size}
            </span>
          )}
          {item.color && (
               <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1 mt-1 w-fit">
                 Color: 
                 <span 
                   className="w-3 h-3 rounded-full border border-gray-300 inline-block" 
                   style={{ backgroundColor: item.color.toLowerCase() }}
                 />
                 {item.color}
               </span>
             )}

          <p className="font-medium text-dark mt-2">₹{item.product?.price?.toLocaleString('en-IN')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-subtle-text/20 rounded-md">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 hover:bg-gray-50 text-dark disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={item.quantity <= 1 || isItemLoading}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 hover:bg-gray-50 text-dark disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isItemLoading}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;