import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { fetchMyOrders } from '../api/orders.api';
import { Package, User, LogOut, Calendar, LayoutDashboard, } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../components/common/Loader';

const UserProfile: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: fetchMyOrders,
        enabled: !!user, // Only fetch if user is logged in
    });

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-primary/30 py-12">
            <div className="container grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar: User Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-light p-6 rounded-xl shadow-(--shadow-soft) text-center">
                        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                            <User className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-dark">{user.name}</h2>
                        <p className="text-sm text-subtle-text">{user.email}</p>
                        <div className="mt-4 pt-4 border-t border-subtle-text/10">
                            <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
                                {user.role} Account
                            </span>
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="w-full flex items-center justify-center p-3 bg-dark text-white rounded-lg hover:bg-black transition-colors shadow-md"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Open Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="bg-light p-2 rounded-xl shadow-(--shadow-soft)">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content: Orders */}
                <div className="lg:col-span-3">
                    <h1 className="text-2xl font-serif text-dark mb-6 flex items-center">
                        <Package className="w-6 h-6 mr-3 text-accent" /> Order History
                    </h1>

                    {isLoading ? (
                        <Loader />
                    ) : orders && orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-light rounded-xl shadow-sm border border-subtle-text/10 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Order Header */}
                                    <div className="bg-secondary/10 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex gap-6 text-sm">
                                            <div>
                                                <p className="text-subtle-text text-xs uppercase tracking-wider">Order Placed</p>
                                                <p className="font-medium text-dark flex items-center mt-1">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-subtle-text text-xs uppercase tracking-wider">Total Amount</p>
                                                <p className="font-medium text-dark mt-1">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-6">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 mb-4 last:mb-0">
                                                <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                    {/* Optional chaining in case product was deleted */}
                                                    <img
                                                        src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
                                                        alt={item.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="grow">
                                                    <h4 className="font-medium text-dark">{item.product?.name || 'Product unavailable'}</h4>
                                                    <p className="text-sm text-subtle-text">Qty: {item.quantity} × ₹{item.price}</p>
                                                </div>
                                                {/* If you implement a review system later, button goes here */}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Actions (Optional) */}
                                    {order.paymentInfo?.razorpayPaymentId && (
                                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-subtle-text flex justify-between items-center">
                                            <span>Payment ID: {order.paymentInfo.razorpayPaymentId}</span>
                                            {/* Link to Invoice could go here */}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-light rounded-xl border border-dashed border-subtle-text/30">
                            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-medium text-dark">No orders yet</h3>
                            <p className="text-subtle-text mb-6">Looks like you haven't made your first purchase.</p>
                            <button onClick={() => navigate('/products')} className="btn-primary">
                                Start Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;