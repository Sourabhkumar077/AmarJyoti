import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, ShieldCheck, Lock, CreditCard,PlusCircle } from 'lucide-react';
import { useAppSelector } from '../store/hooks'; 
import apiClient from '../api/client';
import { State, City } from 'country-state-city';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  //  Added (state: any) to bypass implicit any error
  const { items } = useAppSelector((state: any) => state.cart);

  // Form State
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: 'India', // Default Fixed
    pincode: ''
  });

  // Location Data States
  const [allStates, setAllStates] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState('');
  
  // 1. Initial Load: Get States & Check Cart
  useEffect(() => {
    // Load all states of India
    const states = State.getStatesOfCountry('IN');
    setAllStates(states);

    // Redirect if cart is empty
    if (items.length === 0) {
      toast.error("Cart is empty");
      navigate('/cart');
    }
  }, [items, navigate]);

  // 2. Calculate Totals
  //  Added types to reduce parameters (acc: number, item: any)
  const subtotal = items.reduce((acc: number, item: any) => {
    const price = item.product?.price || 0; 
    return acc + (price * item.quantity);
  }, 0);

  const shipping = subtotal < 1999 ? 100 : 0;
  const total = subtotal + shipping;

  // 3. Handle State Selection -> Populate Cities
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    const stateObj = allStates.find(s => s.isoCode === stateCode);
    
    setAddress({ ...address, state: stateObj?.name || '', city: '' });
    setSelectedStateCode(stateCode);

    // Fetch cities for this state
    const cities = City.getCitiesOfState('IN', stateCode);
    setAllCities(cities);
  };

  // 4. API Mutation: Create Order & Redirect to PhonePe
  const createOrderMutation = useMutation({
    mutationFn: async (shippingData: any) => {
      // send address to backend
      const res = await apiClient.post('/payment/order', { shippingAddress: shippingData });
      return res.data; // Backend returns { url: "https://phonepe..." }
    },
    onSuccess: (data) => {
    
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from server");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Could not initiate payment. Try again.");
    }
  });

  // 5. Handle Form Submit
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    // Basic Validation
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill in all address fields.");
      return;
    }

    createOrderMutation.mutate(address);
  };

  return (
    <div className="min-h-screen py-12 bg-primary/30">
      <div className="container">
        <h1 className="text-3xl font-serif text-dark mb-8 text-center md:text-left">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* === LEFT: ADDRESS FORM === */}
          <div className="space-y-6">
            <div className="bg-light p-8 rounded-xl shadow-sm border border-subtle-text/10">
              <h2 className="text-xl font-serif mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-accent" /> Shipping Address
              </h2>

              <form id="checkout-form" onSubmit={handlePayment} className="space-y-5">
                
                {/* Country (Read Only) */}
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

                {/* State & City Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* State */}
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

                  {/* City */}
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

           
          </div>

          {/* === RIGHT: ORDER SUMMARY === */}
          <div>
              <div className="bg-light p-8 rounded-xl shadow-sm border border-subtle-text/10 sticky top-24">
              <h2 className="text-xl font-serif mb-6 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-accent" /> Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item: any) => (
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
              {/* ADD MORE PRODUCTS BUTTON (Marketing Trigger) */}
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="w-full mb-6 group flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-subtle-text/30 rounded-xl text-sm font-medium text-subtle-text hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200"
              >
                <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Add More Products
              </button>

              {/* Price Breakdown */}
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

              {/* Payment Button */}
              <button 
                type="submit" 
                form="checkout-form"
                disabled={createOrderMutation.isPending}
                className="w-full bg-accent hover:bg-yellow-600 text-white font-bold py-3.5 rounded-lg transition-colors mt-6 flex justify-center items-center gap-2 shadow-lg shadow-accent/20"
              >
                {createOrderMutation.isPending ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Pay with PhonePe
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center text-xs text-subtle-text gap-1">
                <Lock className="w-3 h-3" /> Secure Payment via PhonePe Gateway
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;