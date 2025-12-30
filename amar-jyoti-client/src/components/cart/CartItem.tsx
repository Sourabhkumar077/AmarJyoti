import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  updateCartItemAsync,
  removeFromCartAsync,
  updateCartItemLocal,
  removeFromCartLocal
} from '../../store/slices/cartSlice';

interface CartItemProps {
  item: any;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;

    if (user) {
      dispatch(updateCartItemAsync({
        productId: item.productId,
        quantity: newQty
      }));
    } else {
      // For local cart, we should ideally use size to identify item too.
      // But for now keeping it simple as per slice implementation
      dispatch(updateCartItemLocal({ id: item.productId, quantity: newQty, size: item.size }));
    }
  };

  const handleRemove = () => {
    if (user) {
      const idToSend = item.productId || item.product._id;
      //  Pass Size for removal
      dispatch(removeFromCartAsync({id: idToSend, size: item.size,color: item.color}));
    } else {
      //  Pass Size for local removal
      dispatch(removeFromCartLocal({id: item.productId, size: item.size, color: item.color}));
    }
  };

  return (
    <div className="flex gap-4 py-4 border-b border-subtle-text/10">
      <div className="w-24 h-32 shrink-0 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
          alt={item.product?.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-serif text-dark text-lg">{item.product?.name}</h3>
            <button
              onClick={handleRemove}
              className="text-subtle-text hover:text-error transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-subtle-text mt-1">
            {item.product?.category?.name || 'Ethnic Wear'}
          </p>

          {/*  Display Size Badge if size exists */}
          {item.size && (
            <span className="text-xs font-medium text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">
              Size: {item.size}
            </span>
          )}
          {/* color badge */}
          {item.color && (
               <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
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
              className="p-2 hover:bg-gray-50 text-dark disabled:opacity-50"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 hover:bg-gray-50 text-dark"
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