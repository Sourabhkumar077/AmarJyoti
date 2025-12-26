import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Package, MapPin, LogOut, ChevronRight, 
  Mail, Phone, Plus, ShoppingBag, ArrowRight,
  X, Star, Trash2, MessageSquare,
  LayoutDashboard // Icon
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout, setCredentials } from '../store/slices/authSlice';
import apiClient from '../api/client';
import Loader from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { fetchMyReviews, deleteReview } from '../api/reviews.api';
import toast from 'react-hot-toast';

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
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state: any) => state.auth); // Fixed: Added state:any
  
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'reviews'>('orders');
  // REMOVED: isEditing state was unused
  const [newAddressMode, setNewAddressMode] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [addrForm, setAddrForm] = useState({ street: '', city: '', state: '', country: 'India', pincode: '', isDefault: false });

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  // Queries
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await apiClient.get('/orders/my-orders')).data
  });

  const { data: myReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: fetchMyReviews,
    enabled: activeTab === 'reviews'
  });

  // Mutations
  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      toast.success("Review deleted");
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => (await apiClient.put('/auth/profile', data)).data,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: localStorage.getItem('token') || '' }));
      setNewAddressMode(false); 
      toast.success("Profile Updated! ✅");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Update Failed")
  });

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

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
              <p className="text-xs text-subtle-text uppercase mt-1 tracking-widest">{user.role}</p>
              
              <div className="mt-6 flex flex-col gap-3 text-sm text-left border-t border-gray-100 pt-4">
                 <div className="flex items-center gap-3 text-dark"><Phone className="w-4 h-4 text-accent" /> {user.phone || "Add Phone No"}</div>
                 <div className="flex items-center gap-3 text-dark break-all"><Mail className="w-4 h-4 text-accent shrink-0" /> {user.email}</div>
              </div>
            </div>

            <div className="bg-light rounded-xl shadow-sm overflow-hidden border border-subtle-text/10">
             
              <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'orders' ? 'bg-accent/10 text-accent font-medium border-l-4 border-accent' : 'text-subtle-text hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3"><Package className="w-5 h-5" /> My Orders</div><ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'reviews' ? 'bg-accent/10 text-accent font-medium border-l-4 border-accent' : 'text-subtle-text hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5" /> My Reviews</div><ChevronRight className="w-4 h-4" />
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
            
            
            {user.role === 'admin' && (
              <div className="bg-dark text-white p-5 rounded-xl shadow-lg mb-8 flex flex-wrap justify-between items-center gap-4 relative overflow-hidden group">
                 {/* Decorative Circle */}
                 <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl group-hover:bg-accent/30 transition-all"></div>
                 
                 <div>
                    <h3 className="text-xl font-serif font-bold text-accent flex items-center gap-2">
                       <LayoutDashboard className="w-5 h-5" /> Admin Panel
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Manage orders, products, and reviews.</p>
                 </div>
                 
                 <button 
                    onClick={() => navigate('/admin')} 
                    className="relative z-10 bg-accent hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2"
                 >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            )}

            {/* TAB CONTENT */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-dark">Order History</h2>
                {ordersLoading ? <Loader /> : (
                   <div className="space-y-4">
                      {(!orders || orders.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-subtle-text/30 text-center">
                           <ShoppingBag className="w-10 h-10 text-accent mb-4" />
                           <p className="text-subtle-text mb-4">You haven't placed any orders yet.</p>
                           <button onClick={() => navigate('/')} className="bg-accent text-white px-6 py-2 rounded-full">Start Shopping</button>
                        </div>
                      ) : (
                        orders.map((order: any) => (
                          <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-subtle-text/10">
                             <div className="flex justify-between mb-4 pb-4 border-b">
                                <p className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColors[order.status]}`}>{order.status}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <div className="flex -space-x-2">
                                  {order.items.slice(0, 3).map((item: any, i: number) => (
                                    <img key={i} src={item.product?.images?.[0]} className="w-10 h-10 rounded-full border-2 border-white object-cover bg-gray-100" />
                                  ))}
                                </div>
                                <div className="text-right">
                                   <p className="font-bold">₹{order.totalAmount}</p>
                                   <button onClick={() => setSelectedOrder(order)} className="text-xs text-accent hover:underline">View Details</button>
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-dark">My Reviews</h2>
                {reviewsLoading ? <Loader /> : (
                   <div className="space-y-4">
                      {(!myReviews || myReviews.length === 0) ? (
                        <div className="p-10 bg-white rounded-xl text-center text-gray-500">
                           <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                           You haven't reviewed any products yet.
                        </div>
                      ) : (
                        myReviews.map((rev: any) => (
                          <div key={rev._id} className="bg-white p-6 rounded-xl shadow-sm border border-subtle-text/10 flex gap-4">
                             <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden shrink-0 cursor-pointer" onClick={() => navigate(`/product/${rev.product._id}`)}>
                                <img src={rev.product?.images?.[0]} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between items-start">
                                   <h3 className="font-medium text-dark cursor-pointer hover:text-accent" onClick={() => navigate(`/product/${rev.product._id}`)}>{rev.product?.name}</h3>
                                   <button onClick={() => { if(confirm("Delete Review?")) deleteReviewMutation.mutate(rev._id) }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="flex text-yellow-400 my-1">
                                   {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">"{rev.comment}"</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(rev.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
               <div className="bg-light p-8 rounded-xl shadow-sm">
                  <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
                  <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(formData); }} className="space-y-4 max-w-lg">
                      <input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full p-3 border rounded" placeholder="Name" />
                      <input value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} className="w-full p-3 border rounded" placeholder="Phone" />
                      <button type="submit" disabled={updateProfileMutation.isPending} className="bg-accent text-white px-6 py-2 rounded hover:bg-yellow-600 transition">
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                   </form>
               </div>
            )}
            
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
      
      {selectedOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
               <div className="flex justify-between mb-4"><h3 className="font-bold">Order Details</h3><button onClick={()=>setSelectedOrder(null)}><X/></button></div>
               <p className="text-sm mb-2">Order ID: {selectedOrder._id}</p>
               <div className="space-y-2 max-h-60 overflow-y-auto">
                 {selectedOrder.items.map((item:any, i:number) => (
                    <div key={i} className="flex justify-between text-sm">
                       <span>{item.product?.name} (x{item.quantity})</span>
                       <span>₹{item.price * item.quantity}</span>
                    </div>
                 ))}
               </div>
               <div className="mt-4 pt-4 border-t flex justify-between font-bold"><span>Total</span><span>₹{selectedOrder.totalAmount}</span></div>
            </div>
         </div>
      )}
    </div>
  );
};

export default UserProfile;