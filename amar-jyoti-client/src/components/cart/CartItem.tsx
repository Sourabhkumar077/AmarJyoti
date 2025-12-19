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

  // Handle Quantity Change
  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    
    if (user) {
      // Logged In: Server Update
      // Note: Backend item._id ya item.product._id mang sakta hai, confirm structure
      dispatch(updateCartItemAsync({ cartItemId: item.product._id, quantity: newQty }));
    } else {
      // Guest: Local Update
      dispatch(updateCartItemLocal({ id: item.productId, quantity: newQty }));
    }
  };

  // Handle Remove
  const handleRemove = () => {
    if (user) {
      // Logged In: Server Remove
      // Server usually expects the Product ID or Item ID based on your API
      dispatch(removeFromCartAsync(item._id || item.product._id));
    } else {
      // Guest: Local Remove
      dispatch(removeFromCartLocal(item.productId));
    }
  };

  return (
    <div className="flex gap-4 py-4 border-b border-subtle-text/10">
      {/* Product Image */}
      <div className="w-24 h-32 shrink-0 bg-gray-100 rounded-md overflow-hidden">
        <img 
          src={item.product?.images?.[0] || 'https://via.placeholder.com/150'} 
          alt={item.product?.name} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
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
          <p className="font-medium text-dark mt-2">₹{item.product?.price?.toLocaleString('en-IN')}</p>
        </div>

        {/* Quantity Controls */}
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