import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { addToCartOptimistic, removeFromCart } from '../../store/slices/cartSlice'; 
import { Link } from 'react-router-dom';

// Note: In a real Redux app, you'd likely have a 'updateQuantity' and 'removeItem' action. 
// For this tutorial, I will simulate updates using the existing reducer structure or we can quickly add a remove action.
// Let's assume we update the slice below to include `removeFromCart`.

interface CartItemProps {
  item: {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  };
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();

  // Helper to handle quantity changes
  const updateQuantity = (newQty: number) => {
    if (newQty < 1) return;
    const delta = newQty - item.quantity;
    dispatch(addToCartOptimistic({ ...item, quantity: delta }));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-6 border-b border-subtle-text/10 last:border-0">
      {/* Image */}
      <Link to={`/product/${item.productId}`} className="w-24 h-32 bg-secondary/10 rounded-md overflow-hidden shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
      </Link>

      {/* Info */}
      <div className="grow text-center sm:text-left">
        <Link to={`/product/${item.productId}`} className="font-serif text-lg text-dark hover:text-accent transition-colors">
          {item.name}
        </Link>
        <p className="text-sm text-subtle-text mt-1">
          Price: ₹{item.price.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Quantity */}
        <div className="flex items-center border border-subtle-text/20 rounded-full">
          <button 
            onClick={() => updateQuantity(item.quantity - 1)}
            className="p-2 hover:text-accent transition-colors disabled:opacity-30"
            disabled={item.quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium text-sm tabular-nums">{item.quantity}</span>
          <button 
            onClick={() => updateQuantity(item.quantity + 1)}
            className="p-2 hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Total for this line */}
        <span className="font-medium text-dark min-w-20 text-right hidden sm:block">
          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
        </span>

        {/* Remove (For now, we just disable it visually or set logic later. 
            Ideally, Redux slice needs a 'removeItem' action) */}
        <button 
          className="p-2 text-subtle-text hover:text-error hover:bg-error/10 rounded-full transition-all"
          title="Remove Item"
          onClick={() => {
             // In a real app: dispatch(removeFromCart(item.productId))
             // For this demo, let's just log it or implement the slice update if requested.
             dispatch(removeFromCart(item.productId))
          }}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;