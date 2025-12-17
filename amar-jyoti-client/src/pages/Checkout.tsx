import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import apiClient from '../api/client';
import { loadRazorpayScript } from '../utils/loadRazorpay';

// TypeScript definition for Razorpay on Window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  // Form State
  const [address, setAddress] = useState({
    street: '',
    city: '',
    pincode: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate Totals
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 1999 ? 0 : 150;
  const total = subtotal + shipping;

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // API 1: Create Order
  const createOrderMutation = useMutation({
    mutationFn: async (shippingData: any) => {
      const res = await apiClient.post('/payment/order', { shippingAddress: shippingData });
      return res.data;
    }
  });

  // API 2: Verify Payment
  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const res = await apiClient.post('/payment/verify', paymentData);
      return res.data;
    },
    onSuccess: () => {
      dispatch(clearCart());
      navigate('/order-success');
    },
    onError: () => {
      setErrorMsg("Payment verification failed. Please contact support.");
    }
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Load Script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setErrorMsg('Razorpay SDK failed to load. Check your internet.');
      return;
    }

    // 2. Create Order on Backend
    createOrderMutation.mutate(address, {
      onSuccess: (data) => {
        // 3. Open Razorpay Modal
        const options = {
          key: data.key, // Public Key from Backend
          amount: data.amount,
          currency: data.currency,
          name: "Amar Jyoti",
          description: "Purchase of Authentic Ethnic Wear",
          image: "https://ik.imagekit.io/ikmedia/blog/hero-image.jpg", // Replace with your logo URL
          order_id: data.razorpayOrderId, 
          handler: function (response: any) {
            // 4. Verify Payment on Success
            verifyPaymentMutation.mutate({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: "" // Optional: Add phone field to user model later
          },
          theme: {
            color: "#D4AF37" // Matches our Accent Color
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      },
      onError: (err: any) => {
        setErrorMsg(err.response?.data?.message || "Could not initiate order.");
      }
    });
  };

  return (
    <div className="min-h-screen py-12 bg-primary/30">
      <div className="container">
        <h1 className="text-3xl font-serif text-dark mb-8 text-center md:text-left">Secure Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left: Shipping Form */}
          <div className="space-y-6">
            <div className="bg-light p-6 rounded-xl shadow-(--shadow-soft)">
              <h2 className="text-xl font-serif mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-accent" /> Shipping Address
              </h2>

              <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Street Address</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-subtle-text/20 rounded-md focus:outline-none focus:border-accent"
                    placeholder="House No, Street Area"
                    value={address.street}
                    onChange={e => setAddress({...address, street: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">City</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-3 border border-subtle-text/20 rounded-md focus:outline-none focus:border-accent"
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Pincode</label>
                    <input 
                      required
                      type="text" 
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="w-full p-3 border border-subtle-text/20 rounded-md focus:outline-none focus:border-accent"
                      placeholder="400001"
                      value={address.pincode}
                      onChange={e => setAddress({...address, pincode: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Error Display */}
            {errorMsg && (
              <div className="bg-red-50 text-error p-4 rounded-md text-sm border border-red-200">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div>
             <div className="bg-light p-6 rounded-xl shadow-(--shadow-soft) sticky top-24">
              <h2 className="text-xl font-serif mb-6 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-accent" /> Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded overflow-hidden">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-dark">{item.name}</p>
                        <p className="text-subtle-text">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-subtle-text/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-subtle-text">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-subtle-text">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between font-serif text-lg text-dark pt-2 border-t border-dashed border-subtle-text/30 mt-2">
                  <span>Total to Pay</span>
                  <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={createOrderMutation.isPending || verifyPaymentMutation.isPending}
                className="w-full btn-primary mt-6 flex justify-center items-center gap-2 shadow-lg shadow-accent/20"
              >
                {(createOrderMutation.isPending || verifyPaymentMutation.isPending) ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay with Razorpay
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center text-xs text-subtle-text gap-1">
                <Lock className="w-3 h-3" /> Secure 256-bit SSL encrypted payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;