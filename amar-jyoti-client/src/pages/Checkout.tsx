import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import apiClient from '../api/client';
import { loadRazorpayScript } from '../utils/loadRazorpay';

// 👇 1. Library Import karein
import { State, City } from 'country-state-city';

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
    state: '',
    country: 'India', // Default Country Name
    pincode: ''
  });

  
  const [allStates, setAllStates] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState(''); 

  const [errorMsg, setErrorMsg] = useState('');


  useEffect(() => {
    const statesOfIndia = State.getStatesOfCountry('IN');
    setAllStates(statesOfIndia);
  }, []);

  // Calculation Logic (Same as before)
  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.price || 0; 
    return acc + (price * item.quantity);
  }, 0);
  const shipping = subtotal < 1999 ? 100 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items, navigate]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value; // Yeh 'MH', 'DL', 'UP' jesa code hoga
    const stateObj = allStates.find(s => s.isoCode === stateCode);
    
    setAddress({ ...address, state: stateObj?.name || '', city: '' });
    
    setSelectedStateCode(stateCode);

    const cities = City.getCitiesOfState('IN', stateCode);
    setAllCities(cities);
  };

  // API 1: Create Order
  const createOrderMutation = useMutation({
    mutationFn: async (shippingData: any) => {
      const payload = {
        street: shippingData.street,
        city: shippingData.city,
        state: shippingData.state,      
        country: shippingData.country,
        pincode: shippingData.pincode
      };
      const res = await apiClient.post('/payment/order', { shippingAddress: payload });
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

    if (!address.street || !address.city || !address.state || !address.pincode) {
      setErrorMsg("Please fill in all address fields.");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setErrorMsg('Razorpay SDK failed to load. Check your internet.');
      return;
    }

    createOrderMutation.mutate(address, {
      onSuccess: (data) => {
        const options = {
          key: data.key, 
          amount: data.amount, 
          currency: data.currency,
          name: "Amar Jyoti",
          description: "Ethnic Wear Purchase",
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
          theme: { color: "#D4AF37" }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left: Shipping Form */}
          <div className="space-y-6">
            <div className="bg-light p-8 rounded-xl shadow-sm border border-subtle-text/10">
              <h2 className="text-xl font-serif mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-accent" /> Shipping Address
              </h2>

              <form id="checkout-form" onSubmit={handlePayment} className="space-y-5">
                
                {/* Country (Fixed to India for now, easier for logic) */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Country</label>
                  <input 
                    type="text" 
                    disabled
                    value="India"
                    className="w-full p-3 border border-subtle-text/20 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Street Address</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-subtle-text/20 rounded-md focus:outline-none focus:border-accent"
                    placeholder="House No, Street Area, Landmark"
                    value={address.street}
                    onChange={e => setAddress({...address, street: e.target.value})}
                  />
                </div>

                {/* State & City Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* State Dropdown - Populated from Library */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">State</label>
                    <select 
                      required
                      className="w-full p-3 border border-subtle-text/20 rounded-md focus:outline-none focus:border-accent bg-white cursor-pointer"
                      value={selectedStateCode}
                      onChange={handleStateChange}
                    >
                      <option value="" disabled>Select State</option>
                      {allStates.map((state) => (
                        <option key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Dropdown - Populated based on State */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">City</label>
                    <select 
                      required
                      className={`w-full p-3 border border-subtle-text/20 rounded-md focus:outline-none focus:border-accent bg-white cursor-pointer ${!selectedStateCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      disabled={!selectedStateCode}
                    >
                      <option value="" disabled>
                        {selectedStateCode ? 'Select City' : 'Select State First'}
                      </option>
                      {allCities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Pincode</label>
                  <input 
                    required
                    type="text" 
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="w-full md:w-1/2 p-3 border border-subtle-text/20 rounded-md focus:outline-none focus:border-accent"
                    placeholder="400001"
                    value={address.pincode}
                    onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
              </form>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 text-error p-4 rounded-md text-sm border border-red-200">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right: Order Summary (Same as before) */}
          <div>
             <div className="bg-light p-8 rounded-xl shadow-sm border border-subtle-text/10 sticky top-24">
              <h2 className="text-xl font-serif mb-6 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-accent" /> Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-secondary/10 rounded overflow-hidden shrink-0">
                        <img 
                          src={item.product?.images?.[0] || 'https://via.placeholder.com/50'} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-medium text-dark line-clamp-1">{item.product?.name}</p>
                        <p className="text-subtle-text text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
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
                  <span className={subtotal >= 1999 ? 'text-green-600 font-medium' : ''}>
                    {subtotal >= 1999 ? 'Free' : '₹100'}
                  </span>
                </div>
                <div className="border-t border-dashed border-subtle-text/30 my-2"></div>
                <div className="flex justify-between font-serif text-xl text-dark pt-2">
                  <span>Total to Pay</span>
                  <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={createOrderMutation.isPending || verifyPaymentMutation.isPending}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-lg transition-colors mt-6 flex justify-center items-center gap-2 shadow-lg shadow-accent/20"
              >
                {(createOrderMutation.isPending || verifyPaymentMutation.isPending) ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Pay with Razorpay
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