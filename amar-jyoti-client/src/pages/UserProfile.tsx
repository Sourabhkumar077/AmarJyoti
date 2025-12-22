import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  User, Package, MapPin, LogOut, ChevronRight, 
  Mail, Phone, Edit2, Plus, ShoppingBag, ArrowRight,
   X, CreditCard, Clock
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout, setCredentials } from '../store/slices/authSlice';
import apiClient from '../api/client';
import Loader from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Placed': 'bg-blue-100 text-blue-800',
  'Packed': 'bg-indigo-100 text-indigo-800',
  'Shipped': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [newAddressMode, setNewAddressMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modal State for Order Details
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  
  const [addrForm, setAddrForm] = useState({
    street: '', city: '', state: '', country: 'India', pincode: '', isDefault: false
  });

  // 1. Sync Form Data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // 2. Fetch Orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/my-orders');
      return res.data;
    }
  });

  // 3. Update Profile API
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ 
        user: data.user, 
        token: localStorage.getItem('token') || '' 
      }));
      setIsEditing(false);
      setNewAddressMode(false);
      setErrorMsg('');
      alert("Profile Updated Successfully! ✅");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Update Failed");
    }
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return <div className="text-center py-20">Please log in.</div>;

  return (
    <div className="min-h-screen bg-primary/20 py-12 relative">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* === LEFT SIDEBAR === */}
          <div className="w-full md:w-1/4 shrink-0 space-y-6">
            <div className="bg-light p-6 rounded-xl shadow-sm text-center border border-subtle-text/10">
              <div className="w-24 h-24 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4 text-3xl font-serif text-accent font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-dark">{user.name}</h2>
              <div className="mt-6 flex flex-col gap-3 text-sm text-left border-t border-gray-100 pt-4">
                 <div className="flex items-center gap-3 text-dark">
                    <Phone className="w-4 h-4 text-accent" /> {user.phone || "Add Phone No"}
                 </div>
                 <div className="flex items-center gap-3 text-dark break-all">
                    <Mail className="w-4 h-4 text-accent shrink-0" /> {user.email}
                 </div>
              </div>
            </div>

            <div className="bg-light rounded-xl shadow-sm overflow-hidden border border-subtle-text/10">
              <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'orders' ? 'bg-accent/10 text-accent font-medium border-l-4 border-accent' : 'text-subtle-text hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3"><Package className="w-5 h-5" /> My Orders</div><ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'profile' ? 'bg-accent/10 text-accent font-medium border-l-4 border-accent' : 'text-subtle-text hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3"><User className="w-5 h-5" /> Edit Profile</div><ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'addresses' ? 'bg-accent/10 text-accent font-medium border-l-4 border-accent' : 'text-subtle-text hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5" /> Addresses</div><ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-error hover:bg-red-50 transition-colors border-t border-gray-100">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>

          {/* === RIGHT CONTENT === */}
          <div className="flex-1">
            
            {/* TAB: ORDERS (IMPROVED UI) */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-dark">Order History</h2>
                {ordersLoading ? <Loader /> : (
                   <div className="space-y-4">
                      {(!orders || orders.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-subtle-text/30 shadow-sm text-center">
                           <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                              <ShoppingBag className="w-10 h-10 text-accent" />
                           </div>
                           <h3 className="text-2xl font-serif font-bold text-dark mb-3">Your wardrobe looks empty!</h3>
                           <p className="text-subtle-text max-w-md mx-auto mb-8 leading-relaxed">You haven't placed any orders yet.</p>
                           <button onClick={() => navigate('/')} className="bg-accent hover:bg-yellow-600 text-white px-8 py-3.5 rounded-full font-medium transition-all flex items-center gap-2">
                              Start Shopping <ArrowRight className="w-5 h-5" />
                           </button>
                        </div>
                      ) : (
                        orders.map((order: any) => (
                          <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-subtle-text/10 hover:shadow-md transition-shadow">
                             {/* Order Header */}
                             <div className="flex flex-wrap justify-between items-start mb-4 border-b border-gray-100 pb-4 gap-4">
                                <div>
                                    <p className="text-xs text-subtle-text uppercase mb-1">Order ID</p>
                                    <p className="font-mono text-sm font-medium text-dark">#{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-subtle-text uppercase mb-1">Date Placed</p>
                                    <p className="text-sm font-medium text-dark flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(order.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-subtle-text uppercase mb-1">Total Amount</p>
                                    <p className="font-bold text-accent text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                </div>
                             </div>

                             {/* Product Thumbnails & Action */}
                             <div className="flex justify-between items-center">
                                <div className="flex -space-x-3 overflow-hidden">
                                  {order.items.slice(0, 4).map((item: any, idx: number) => (
                                    <img 
                                      key={idx}
                                      src={item.product?.images?.[0] || 'https://via.placeholder.com/50'} 
                                      alt="Product"
                                      className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover bg-gray-100"
                                    />
                                  ))}
                                  {order.items.length > 4 && (
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-subtle-text">
                                      +{order.items.length - 4}
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col md:flex-row items-end gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-100 border-gray-200'}`}>
                                    {order.status}
                                  </span>
                                  <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-sm font-medium text-accent hover:text-yellow-700 flex items-center gap-1 hover:underline"
                                  >
                                    View Details <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE (Same as before) */}
            {activeTab === 'profile' && (
               <div className="bg-light p-8 rounded-xl shadow-sm border border-subtle-text/10">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-serif font-bold text-dark">Personal Information</h2>
                     {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-accent text-sm font-medium hover:underline">
                           <Edit2 className="w-4 h-4" /> Edit Details
                        </button>
                     )}
                  </div>
                  {errorMsg && <div className="bg-red-50 text-error p-3 rounded mb-4 text-sm">{errorMsg}</div>}
                  <form className="space-y-6 max-w-lg" onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(formData); }}>
                     <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input type="text" disabled={!isEditing} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-md disabled:bg-gray-50 focus:border-accent outline-none"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input type="tel" disabled={!isEditing} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded-md disabled:bg-gray-50 focus:border-accent outline-none" placeholder="Enter phone number"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input type="email" disabled={true} value={user.email} className="w-full p-3 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"/>
                     </div>
                     {isEditing && (
                        <div className="flex gap-4 pt-4">
                           <button type="button" onClick={() => { setIsEditing(false); setErrorMsg(''); setFormData({name: user.name, phone: user.phone || ''}); }} className="px-6 py-2 border rounded-md text-subtle-text hover:bg-gray-50">Cancel</button>
                           <button type="submit" disabled={updateProfileMutation.isPending} className="px-6 py-2 bg-accent text-white rounded-md hover:bg-yellow-600 shadow-md">{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                     )}
                  </form>
               </div>
            )}

            {/* TAB: ADDRESSES (Same as before) */}
            {activeTab === 'addresses' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h2 className="text-2xl font-serif font-bold text-dark">Saved Addresses</h2>
                     {!newAddressMode && (
                       <button onClick={() => setNewAddressMode(true)} className="flex items-center gap-2 bg-dark text-white px-4 py-2 rounded-md hover:bg-black transition shadow-lg text-sm">
                          <Plus className="w-4 h-4" /> Add New
                       </button>
                     )}
                  </div>
                  {newAddressMode && (
                    <div className="bg-light p-6 rounded-xl border border-accent/30 shadow-sm animate-fade-in-up">
                      <h3 className="font-medium text-dark mb-4">Add New Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-full">
                           <input placeholder="Street Address / House No" className="w-full p-3 border rounded-md focus:border-accent outline-none" value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} />
                        </div>
                        <input placeholder="City" className="w-full p-3 border rounded-md focus:border-accent outline-none" value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} />
                        <input placeholder="Pincode" maxLength={6} className="w-full p-3 border rounded-md focus:border-accent outline-none" value={addrForm.pincode} onChange={e => setAddrForm({...addrForm, pincode: e.target.value})} />
                        <input placeholder="State" className="w-full p-3 border rounded-md focus:border-accent outline-none" value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} />
                        <input placeholder="Country" className="w-full p-3 border rounded-md focus:border-accent outline-none" value={addrForm.country} onChange={e => setAddrForm({...addrForm, country: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" id="def" checked={addrForm.isDefault} onChange={e => setAddrForm({...addrForm, isDefault: e.target.checked})} />
                        <label htmlFor="def" className="text-sm">Set as Default Address</label>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => updateProfileMutation.mutate({ address: addrForm })} disabled={updateProfileMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-yellow-600">{updateProfileMutation.isPending ? 'Saving...' : 'Save Address'}</button>
                        <button onClick={() => setNewAddressMode(false)} className="px-4 py-2 text-subtle-text">Cancel</button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {user.addresses && user.addresses.length > 0 ? (
                       user.addresses.map((addr: any, idx: number) => (
                        <div key={idx} className={`bg-light p-6 rounded-xl border relative ${addr.isDefault ? 'border-accent shadow-md' : 'border-subtle-text/20'}`}>
                           {addr.isDefault && <span className="absolute top-4 right-4 text-xs bg-accent text-white px-2 py-1 rounded-full font-medium">Default</span>}
                           <div className="flex items-start gap-3">
                             <MapPin className="w-5 h-5 text-subtle-text mt-1" />
                             <div>
                                <p className="text-dark font-medium">{addr.street}</p>
                                <p className="text-sm text-subtle-text">{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="text-xs text-subtle-text uppercase mt-1 tracking-wide">{addr.country}</p>
                             </div>
                           </div>
                        </div>
                     ))
                     ) : (
                        !newAddressMode && (
                          <div className="col-span-full text-center py-10 bg-light rounded-xl border border-dashed border-subtle-text/30">
                             <p className="text-subtle-text">No addresses saved yet.</p>
                          </div>
                        )
                     )}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* === ORDER DETAILS MODAL (POPUP) === */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-serif font-bold text-dark">Order Details</h2>
                <div className="text-sm text-subtle-text mt-1 flex gap-3">
                   <span>#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                   <span>•</span>
                   <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* Product List */}
              <div>
                <h3 className="font-bold text-dark mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Package className="w-4 h-4 text-accent" /> Items Ordered
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-200">
                        <img 
                          src={item.product?.images?.[0] || 'https://via.placeholder.com/50'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark text-sm">{item.product?.name || "Product Unavailable"}</p>
                        <p className="text-xs text-subtle-text mt-1">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <div className="font-medium text-dark text-sm">
                         ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                   <h3 className="font-bold text-dark mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                     <MapPin className="w-4 h-4 text-accent" /> Delivery Address
                   </h3>
                   <div className="text-sm text-gray-600 space-y-1">
                     <p className="font-medium text-dark">{selectedOrder.shippingAddress.street}</p>
                     <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                     <p>{selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.pincode}</p>
                   </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                   <h3 className="font-bold text-dark mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                     <CreditCard className="w-4 h-4 text-accent" /> Payment Info
                   </h3>
                   <div className="text-sm text-gray-600 space-y-2">
                     <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-medium text-dark">Online (PhonePe)</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Txn ID:</span>
                        <span className="font-mono text-xs text-dark">{selectedOrder.paymentInfo?.transactionId || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="font-bold text-dark">Total Paid:</span>
                        <span className="font-bold text-accent">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                     </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-dark text-white rounded-md hover:bg-black text-sm font-medium transition-colors shadow-lg"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;