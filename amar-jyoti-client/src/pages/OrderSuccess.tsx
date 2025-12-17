import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/30 px-4">
      <div className="max-w-md w-full bg-light p-10 rounded-2xl shadow-(--shadow-hover) text-center">
        
        {/* Animated Checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-3xl font-serif text-dark mb-2">Order Placed!</h1>
        <p className="text-subtle-text mb-8">
          Thank you for shopping with Amar Jyoti. Your order has been confirmed and will be shipped shortly.
        </p>

        <div className="space-y-3">
          <Link 
            to="/products" 
            className="w-full btn-primary flex items-center justify-center"
          >
            Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          
          <Link 
            to="/" 
            className="w-full btn-outline flex items-center justify-center border-none text-subtle-text hover:text-dark hover:bg-transparent"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;