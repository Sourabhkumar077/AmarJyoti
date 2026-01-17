import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchUserProfile } from './store/slices/authSlice'; 
import { fetchCart } from './store/slices/cartSlice';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/common/ScrollToTop';
import { v4 as uuidv4 } from 'uuid';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Category = React.lazy(() => import('./pages/Category'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const AdminLayout = React.lazy(() => import('./components/layout/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const Contact  = React.lazy(()=>import('./pages/Contact'));
const Returns  = React.lazy(()=>import('./pages/ExchangePolicy'));
const ShippingPolicy  = React.lazy(()=>import('./pages/ShippingPolicy'));
const AdminReviews  = React.lazy(()=>import('./pages/admin/AdminReviews'));
const PaymentVerify  = React.lazy(()=>import('./pages/PaymentVerify'));
const ProductForm = React.lazy(()=>import('./pages/admin/ProductForm'));
const AdminProducts = React.lazy(()=>import('./pages/admin/AdminProducts'));

// Protected Route Component (User)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route Component (Admin Only)
const AdminRoute = () => {
  const { user } = useAppSelector((state) => state.auth);
  return (user && user.role === 'admin') ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // 1. Initialize Guest ID if missing
    if (!localStorage.getItem('guest_cart_id')) {
      localStorage.setItem('guest_cart_id', uuidv4());
    }

    // 2. Fetch User & Cart
    const token = localStorage.getItem('token'); 
    if (token) {
      dispatch(fetchUserProfile()); 
    }
    // Always fetch cart (it will use Token OR GuestID)
    dispatch(fetchCart());

  }, [dispatch]);
  
  return (
        <Router>
          <ScrollToTop />
          <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000 }} />
          <div className="flex flex-col min-h-screen bg-primary font-sans">
            <Navbar />
            <main className="grow">
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Category />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/returns" element={<Returns />} />
                  <Route path="/contact" element={<Contact />} />

                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/payment/verify" element={<ProtectedRoute><PaymentVerify /></ProtectedRoute>} />
                  <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                  <Route path="/account" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<ProductForm />} />
                      <Route path="products/edit/:id" element={<ProductForm />} />
                      <Route path="reviews" element={<AdminReviews />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<div className="p-20 text-center text-dark">404 - Page Not Found</div>} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
  );
}

export default App;