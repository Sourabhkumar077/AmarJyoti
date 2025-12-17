import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import CartItem from '../components/cart/CartItem';

const Cart: React.FC = () => {
  const { items, count } = useAppSelector((state) => state.cart);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // Calculate Total
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 1999 ? 0 : 150;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login?redirect=checkout');
    } else {
      // Proceed to checkout page (we will build this next)
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container text-center">
        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-3xl font-serif text-dark mb-2">Your Cart is Empty</h2>
        <p className="text-subtle-text mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. 
          Explore our collection of Sarees and Lehengas.
        </p>
        <Link to="/products" className="btn-primary inline-flex items-center">
          Start Shopping <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-primary/30">
      <div className="container">
        <h1 className="text-3xl font-serif text-dark mb-8">Shopping Bag ({count})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 bg-light rounded-xl shadow-(--shadow-soft) p-6">
            <div className="hidden sm:block border-b border-subtle-text/10 pb-4 mb-4 text-sm text-subtle-text uppercase tracking-wider font-medium">
              Product Details
            </div>
            <div>
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-subtle-text/10 flex justify-start">
               <Link to="/products" className="flex items-center text-accent hover:underline font-medium">
                 <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
               </Link>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-light rounded-xl shadow-(--shadow-soft) p-6 sticky top-24">
              <h3 className="text-xl font-serif text-dark mb-6">Order Summary</h3>
              
              <div className="space-y-4 text-sm text-dark mb-6">
                <div className="flex justify-between">
                  <span className="text-subtle-text">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtle-text">Shipping Estimate</span>
                  <span>{shipping === 0 ? <span className="text-success font-medium">FREE</span> : `₹${shipping}`}</span>
                </div>
                {shipping === 0 && (
                   <div className="text-xs text-success bg-success/10 p-2 rounded text-center">
                     Free shipping unlocked!
                   </div>
                )}
              </div>

              <div className="border-t border-dashed border-subtle-text/30 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-serif text-lg">Total</span>
                  <span className="font-serif text-2xl font-bold text-dark">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-subtle-text mt-1 text-right">Inclusive of all taxes</p>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full btn-primary flex justify-center items-center py-4 text-lg shadow-lg shadow-accent/20"
              >
                Proceed to Checkout
              </button>

              {/* Trust Icons */}
              <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                {/* Placeholder icons for Visa/Mastercard etc */}
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;