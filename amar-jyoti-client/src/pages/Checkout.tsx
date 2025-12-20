import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import apiClient from '../api/client';
import { loadRazorpayScript } from '../utils/loadRazorpay';

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

  
  const subtotal = items.reduce((acc, item) => {
    // Safety check in case product is missing
    const price = item.product?.price || 0; 
    return acc + (price * item.quantity);
  }, 0);


  const shipping = subtotal < 1999 ? 100 : 0;
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

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setErrorMsg('Razorpay SDK failed to load. Check your internet.');
      return;
    }

    createOrderMutation.mutate(address, {
      onSuccess: (data) => {
        const options = {
          key: data.key, 
          amount: data.amount, // Amount in Paise from Backend
          currency: data.currency,
          name: "Amar Jyoti",
          description: "Purchase of Authentic Ethnic Wear",
          // Use a static logo or the first product image
          image: "https://ik.imagekit.io/ikmedia/blog/hero-image.jpg", 
          order_id: data.razorpayOrderId, 
          handler: function (response: any) {
            verifyPaymentMutation.mutate({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: "" 
          },
          theme: {
            color: "#D4AF37"
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
            <div className="bg-light p-6 rounded-xl shadow-sm">
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
             <div className="bg-light p-6 rounded-xl shadow-sm sticky top-24">
              <h2 className="text-xl font-serif mb-6 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-accent" /> Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded overflow-hidden">
                        {/* 🟢 FIX 3: Access nested product image */}
                        <img 
                          src={item.product?.images?.[0] || 'https://via.placeholder.com/50'} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        {/* 🟢 FIX 4: Access nested product name */}
                        <p className="font-medium text-dark">{item.product?.name}</p>
                        <p className="text-subtle-text">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    {/* 🟢 FIX 5: Access nested product price */}
                    <span className="font-medium">
                        ₹{( (item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
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
                  {/* Logic: Free if over 1999, else 100 */}
                  <span>{subtotal >= 1999 ? 'Free' : '₹100'}</span>
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