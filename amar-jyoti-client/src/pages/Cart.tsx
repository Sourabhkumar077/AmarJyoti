import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, PlusCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchCart } from '../store/slices/cartSlice'; 
import CartItem from '../components/cart/CartItem'; 

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { items = [], loading } = useAppSelector((state: any) => state.cart || { items: [] });
  // We can still use user for other UI logic, but not for fetching permissions
  const { user } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    // ✅ FIXED: Always fetch. The backend distinguishes User vs Guest via headers.
    dispatch(fetchCart());
  }, [dispatch]);

  const subtotal = items.reduce((acc: number, item: any) => {
    const price = item.product?.salePrice || item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 1999 ? 0 : 150;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-primary/20 p-6 rounded-full mb-4">
          <ShoppingBag className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-2xl font-serif text-dark mb-2">Your cart is empty</h2>
        <p className="text-subtle-text mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/products" className="btn-primary flex items-center gap-2">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-dark mb-8">Shopping Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              {items.map((item: any) => (
                <CartItem 
                  key={`${item.productId}-${item.size}-${item.color}-${Math.random()}`}
                  item={item} 
                />
              ))}
              
              <button
                 type="button"
                 onClick={() => navigate('/products')}
                 className="w-full mt-4 mb-2 group flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-subtle-text/30 rounded-xl text-sm font-medium text-subtle-text hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200"
              >
                  <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Add More Products
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-serif text-dark mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm pb-6 border-b border-subtle-text/10">
                <div className="flex justify-between text-subtle-text">
                  <span>Subtotal</span>
                  <span className="font-medium text-dark">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-subtle-text">
                  <span>Shipping Estimate</span>
                  <span className="font-medium text-dark">
                    {shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="pt-6 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-dark font-medium">Order Total</span>
                  <span className="text-2xl font-bold text-dark font-serif">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full btn-primary py-4 flex justify-center items-center gap-2 group shadow-lg shadow-accent/20"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="text-center">
                    <Link to="/products" className="text-sm text-subtle-text hover:text-accent transition-colors">
                      or Continue Shopping
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;